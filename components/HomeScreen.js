import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler
} from 'react-native';
import Constants from 'expo-constants';
import uuid from 'react-native-uuid';

const getApiUrl = () => {
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    return `http://${debuggerHost}:3000`;
  }
  return 'https://your-production-api.com';
};

const API_BASE_URL = getApiUrl();
const CHAT_API_URL = 'https://thakur.app.n8n.cloud/webhook/f19d4ceb-8883-4b3e-b324-ef31b8262e83/chat';

export default function ChatInterface({ navigation, route }) {
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';
  const bolId = route?.params?.bolId;

  const conversationRef = useRef([]);
  const [conversation, setConversation] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [sessionId] = useState(uuid.v4().replace(/-/g, ''));
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);

  const scrollViewRef = useRef(null);

  const appendMessage = useCallback((msg) => {
    conversationRef.current = [...conversationRef.current, msg];
    setConversation([...conversationRef.current]);
  }, []);

  // API call to chatbot
  const sendMessageToBot = async (message) => {
    try {
      setIsLoading(true);
      setAwaitingResponse(true);
      
      const requestBody = {
        sessionId: sessionId,
        action: "sendMessage",
        chatInput: message
      };
      
      console.log('Sending request to:', CHAT_API_URL);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Try to get response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      console.log('Parsed response:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error sending message to bot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process bot response and determine if it's options or input request
  const processBotResponse = (response) => {
    // Check if response contains options/buttons
    if (response.options && Array.isArray(response.options) && response.options.length > 0) {
      return {
        type: 'options',
        text: response.message || response.text || '',
        options: response.options
      };
    }
    
    // Check if response is asking for input (common patterns)
    const text = response.message || response.text || '';
    const isInputRequest = text.toLowerCase().includes('enter') || 
                          text.toLowerCase().includes('input') || 
                          text.toLowerCase().includes('provide') ||
                          text.includes(':') && text.toLowerCase().includes('value');
    
    if (isInputRequest) {
      return {
        type: 'input',
        text: text,
        options: null
      };
    }

    // Check if session is completed
    const isCompleted = text.toLowerCase().includes('completed') || 
                       text.toLowerCase().includes('finished') ||
                       text.toLowerCase().includes('done') ||
                       response.sessionComplete === true;

    if (isCompleted) {
      return {
        type: 'completed',
        text: text,
        options: ['Start New Session', 'Exit']
      };
    }

    // Default to regular message
    return {
      type: 'message',
      text: text,
      options: null
    };
  };

  // Handle user selecting an option
  const handleOptionSelect = async (option) => {
    if (sessionCompleted) {
      if (option === 'Start New Session') {
        // Reset session
        setSessionCompleted(false);
        conversationRef.current = [];
        setConversation([]);
        setWelcomeShown(false);
        setAwaitingResponse(false);
        setWaitingForInput(false);
        
        setTimeout(() => {
          initializeChat();
        }, 500);
        return;
      } else if (option === 'Exit') {
        navigation.goBack();
        return;
      }
    }

    // Handle retry option
    if (option === 'Retry') {
      setWelcomeShown(false);
      setTimeout(() => {
        initializeChat();
      }, 500);
      return;
    }

    // Add user message to conversation
    appendMessage({
      id: uuid.v4(),
      role: 'user',
      text: option
    });

    try {
      // Send selected option to bot
      console.log('Sending option to bot:', option);
      const botResponse = await sendMessageToBot(option);
      console.log('Bot response for option:', botResponse);
      
      const processedResponse = processBotResponse(botResponse);
      
      // Add bot response to conversation
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: processedResponse.text,
          options: processedResponse.options
        });

        // Handle different response types
        if (processedResponse.type === 'input') {
          setWaitingForInput(true);
        } else if (processedResponse.type === 'completed') {
          setSessionCompleted(true);
        }
        
        setAwaitingResponse(false);
      }, 400);

    } catch (error) {
      console.error('Error handling option select:', error);
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `❌ Sorry, I encountered an error: ${error.message}`,
          options: ['Retry', 'Exit']
        });
        setAwaitingResponse(false);
      }, 400);
    }
  };

  // Handle text input submission
  const handleTextInput = async (inputText) => {
    if (!inputText.trim()) return;

    // Add user message to conversation
    appendMessage({
      id: uuid.v4(),
      role: 'user',
      text: inputText
    });

    setWaitingForInput(false);
    setMessageInput('');

    try {
      // Send input to bot
      const botResponse = await sendMessageToBot(inputText);
      const processedResponse = processBotResponse(botResponse);
      
      // Add bot response to conversation
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: processedResponse.text,
          options: processedResponse.options
        });

        // Handle different response types
        if (processedResponse.type === 'input') {
          setWaitingForInput(true);
        } else if (processedResponse.type === 'completed') {
          setSessionCompleted(true);
        }
        
        setAwaitingResponse(false);
      }, 800);

    } catch (error) {
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `❌ Sorry, I encountered an error processing your input. Please try again.`,
          options: null
        });
        setAwaitingResponse(false);
      }, 800);
    }
  };

  // Initialize chat session
  const initializeChat = useCallback(async () => {
    if (welcomeShown) return;
    setWelcomeShown(true);
    
    // Show welcome message
    appendMessage({
      id: uuid.v4(),
      role: 'bot',
      text: `Hello! I'm BOLy, your BOL update assistant for ${phoneNumber}.\n\nI'll help you update your BOL fields systematically. Let me get started...`,
      options: null
    });

    try {
      // Test with a simple message first
      console.log('Initializing chat with sessionId:', sessionId);
      const botResponse = await sendMessageToBot('Hello');
      console.log('Bot response received:', botResponse);
      
      const processedResponse = processBotResponse(botResponse);
      
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: processedResponse.text,
          options: processedResponse.options
        });

        if (processedResponse.type === 'input') {
          setWaitingForInput(true);
        }
        
        setAwaitingResponse(false);
      }, 1000);

    } catch (error) {
      console.error('Chat initialization error:', error);
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `❌ Failed to initialize chat session. Error: ${error.message}\n\nPlease check the console for more details.`,
          options: ['Retry', 'Exit']
        });
        setAwaitingResponse(false);
      }, 1000);
    }
  }, [phoneNumber, appendMessage, welcomeShown, sessionId]);

  useEffect(() => {
    if (!bolId) {
      Alert.alert('Error', 'BOL ID is required', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    
    initializeChat();
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    
    return () => backHandler.remove();
  }, []); // Only run on mount

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>BOL Update Assistant</Text>
            </View>
          </View>
          
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              📱 {phoneNumber} • 🤖 BOLy Assistant • 📝 BOL: {bolId}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <Text style={styles.progressText}>
              Session ID: {sessionId} • Status: {sessionCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
          
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {conversation.map(msg => (
              <View key={msg.id} style={styles.messageContainer}>
                <View style={msg.role === 'user' ? styles.userMessageRow : styles.botMessageRow}>
                  {msg.role === 'bot' && <View style={styles.botAvatar}><Text>🤖</Text></View>}
                  <View style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
                    <Text style={msg.role === 'user' ? styles.userMessageText : styles.botMessageText}>
                      {msg.text}
                    </Text>
                  </View>
                  {msg.role === 'user' && <View style={styles.userAvatar}><Text>👤</Text></View>}
                </View>
                
                {msg.role === 'bot' && msg.options && (
                  <View style={styles.optionsContainer}>
                    {msg.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleOptionSelect(option)}
                        style={styles.optionButton}
                        disabled={isLoading}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
            
            {awaitingResponse && (
              <View style={styles.messageContainer}>
                <View style={styles.botMessageRow}>
                  <View style={styles.botAvatar}><Text>🤖</Text></View>
                  <View style={styles.botMessage}>
                    <Text style={styles.typingText}>
                      {isLoading ? 'BOLy is processing...' : 'BOLy is typing...'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          
          {waitingForInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder="Enter your response..."
                onSubmitEditing={() => handleTextInput(messageInput)}
                autoFocus
                editable={!isLoading}
                blurOnSubmit={false}
                multiline
              />
              <TouchableOpacity
                onPress={() => handleTextInput(messageInput)}
                disabled={!messageInput.trim() || isLoading}
                style={[styles.sendButton, (!messageInput.trim() || isLoading) && styles.disabledButton]}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? '...' : '➤'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!waitingForInput && (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>
                {sessionCompleted ? 'Session completed!' :
                  conversation.length > 0 ? 'BOLy is ready to help!' : 'Initializing conversation...'}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 25
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 10
  },
  headerSubtitle: {
    color: '#c7d2fe',
    fontSize: 14,
    marginTop: 2,
  },
  infoBar: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressBar: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  botMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  userMessage: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 12,
    borderBottomRightRadius: 4,
    maxWidth: '70%',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botMessage: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userMessageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  botMessageText: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  typingText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginLeft: 44,
  },
  optionButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  statusBar: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 30,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});