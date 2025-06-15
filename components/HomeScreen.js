import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';

// Backend API configuration
const API_BASE_URL = 'http://your-backend-url.com'; // Replace with your actual backend URL

export default function BOLChatInterface({ navigation, route }) {
  // Get phone number from previous screen (OTP screen)
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';
  
  const [bols, setBols] = useState([]);
  const [selectedBol, setSelectedBol] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [updatedFields, setUpdatedFields] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatInProgress, setChatInProgress] = useState(false);

  // Fetch BOLs from backend
  const fetchBols = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bol/get-bols`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBols(data.bols);
        if (data.bols.length > 0) {
          setSelectedBol(data.bols[0]);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch BOLs');
      }
    } catch (error) {
      console.error('Error fetching BOLs:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Start chat flow with backend
  const startChatFlow = async () => {
    if (!selectedBol || chatInProgress) return;

    try {
      setChatInProgress(true);
      const response = await fetch(`${API_BASE_URL}/bol/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bolId: selectedBol._id,
          updatedFields: [],
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.completed) {
          addBotMessage('All BOL fields are up to date! Is there anything else I can help you with?', ['Start new review', 'Exit']);
        } else {
          setCurrentField(data.field);
          setUpdatedFields(data.updatedFields || []);
          addBotMessage(data.message, data.options);
        }
      } else {
        addBotMessage('Sorry, there was an error starting the chat flow. Please try again.', ['Retry', 'Exit']);
      }
    } catch (error) {
      console.error('Error starting chat flow:', error);
      addBotMessage('Failed to connect to server. Please check your connection and try again.', ['Retry', 'Exit']);
    }
  };

  // Continue chat flow
  const continueChatFlow = async (userChoice) => {
    if (!selectedBol || !currentField) return;

    try {
      let requestBody = {
        bolId: selectedBol._id,
        updatedFields: updatedFields,
      };

      // If user chose to update the field, we need to handle the input
      if (userChoice === 'YES') {
        setWaitingForInput(true);
        addBotMessage(`Please enter the new value for "${currentField}":`, null, true);
        return;
      } else if (userChoice === 'NO') {
        requestBody.change = 'NO';
      }

      const response = await fetch(`${API_BASE_URL}/bol/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.completed) {
          addBotMessage('BOL review completed! All fields have been checked.', ['Start new review', 'Exit']);
          setChatInProgress(false);
        } else {
          setCurrentField(data.field);
          setUpdatedFields(data.updatedFields || []);
          addBotMessage(data.message, data.options);
        }
      } else {
        addBotMessage('There was an error processing your request. Please try again.', ['Retry', 'Exit']);
      }
    } catch (error) {
      console.error('Error in chat flow:', error);
      addBotMessage('Failed to connect to server. Please try again.', ['Retry', 'Exit']);
    }
  };

  // Update BOL field
  const updateBolField = async (fieldValue) => {
    if (!selectedBol || !currentField || !fieldValue.trim()) return;

    try {
      // First update the BOL
      const updateResponse = await fetch(`${API_BASE_URL}/bol/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBol._id,
          update: { [currentField]: fieldValue }
        }),
      });

      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        // Update local BOL data
        const updatedBols = bols.map(bol => 
          bol._id === selectedBol._id 
            ? { ...bol, [currentField]: fieldValue }
            : bol
        );
        setBols(updatedBols);
        setSelectedBol(prev => ({ ...prev, [currentField]: fieldValue }));

        addBotMessage(`Great! I've updated "${currentField}" to "${fieldValue}". Let me check the next field.`);

        // Continue with the chat flow
        const newUpdatedFields = [...updatedFields, currentField];
        setUpdatedFields(newUpdatedFields);

        // Get next field
        setTimeout(async () => {
          const response = await fetch(`${API_BASE_URL}/bol/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              bolId: selectedBol._id,
              updatedFields: newUpdatedFields,
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            if (data.completed) {
              addBotMessage('BOL review completed! All fields have been checked.', ['Start new review', 'Exit']);
              setChatInProgress(false);
            } else {
              setCurrentField(data.field);
              addBotMessage(data.message, data.options);
            }
          }
        }, 1000);

      } else {
        addBotMessage('Failed to update the field. Please try again.', ['Retry', 'Skip']);
      }
    } catch (error) {
      console.error('Error updating BOL:', error);
      addBotMessage('Failed to update the field due to connection error.', ['Retry', 'Skip']);
    }

    setWaitingForInput(false);
    setMessageInput('');
  };

  // Add bot message to conversation
  const addBotMessage = (text, options = null, requiresInput = false) => {
    const botMessage = {
      id: Date.now(),
      role: 'bot',
      text: text,
      options: options,
      requiresInput: requiresInput
    };

    setConversation(prev => [...prev, botMessage]);
  };

  // Add user message to conversation
  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: text
    };

    setConversation(prev => {
      const newConversation = [...prev];
      // Remove options from last bot message
      if (newConversation.length > 0 && newConversation[newConversation.length - 1].role === 'bot') {
        newConversation[newConversation.length - 1] = {
          ...newConversation[newConversation.length - 1],
          options: null,
          requiresInput: false
        };
      }
      return [...newConversation, userMessage];
    });
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    addUserMessage(option);

    setTimeout(() => {
      if (option === 'Start new review') {
        setConversation([]);
        setUpdatedFields([]);
        setCurrentField('');
        setTimeout(() => startChatFlow(), 500);
      } else if (option === 'Exit') {
        addBotMessage('Thank you for using BOLy! Have a great day!');
        setChatInProgress(false);
      } else if (option === 'Retry') {
        if (chatInProgress) {
          continueChatFlow('YES');
        } else {
          startChatFlow();
        }
      } else if (option === 'Skip') {
        continueChatFlow('NO');
      } else {
        continueChatFlow(option);
      }
    }, 500);
  };

  // Handle text input submission
  const handleTextInput = (inputText) => {
    if (!inputText.trim()) return;

    addUserMessage(inputText);
    setTimeout(() => {
      updateBolField(inputText);
    }, 500);
  };

  // Initialize conversation when BOL is selected
  useEffect(() => {
    if (selectedBol && !loading) {
      setConversation([]);
      setUpdatedFields([]);
      setCurrentField('');
      setChatInProgress(false);
      
      setTimeout(() => {
        const welcomeMessage = `Hello! I'm BOLy, your logistics assistant for ${phoneNumber}. I'm here to help you review and update your BOL: ${selectedBol.probarcode || selectedBol._id}. Would you like to start reviewing the BOL fields?`;
        addBotMessage(welcomeMessage, ['Yes, start review', 'Not now']);
      }, 500);
    }
  }, [selectedBol, phoneNumber, loading]);

  // Fetch BOLs on component mount
  useEffect(() => {
    fetchBols();
  }, [phoneNumber]);

  // Format BOL data for display
  const formatBolForDisplay = (bol) => {
    return {
      id: bol._id,
      date: bol.date || 'N/A',
      location: bol.shippercity || bol.consigneecity || 'Unknown',
      packageName: bol.probarcode || `BOL-${bol._id?.slice(-6)}`,
      status: 'pending'
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading BOLs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Sidebar Menu */}
        {menuVisible && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Select BOL</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bolList}>
              {bols.map((bol) => {
                const displayBol = formatBolForDisplay(bol);
                return (
                  <TouchableOpacity
                    key={displayBol.id}
                    onPress={() => {
                      setSelectedBol(bol);
                      setMenuVisible(false);
                    }}
                    style={[
                      styles.bolItem,
                      selectedBol?._id === bol._id ? styles.selectedBol : styles.unselectedBol
                    ]}
                  >
                    <View style={styles.bolHeader}>
                      <Text style={styles.packageIcon}>📦</Text>
                      <Text style={[
                        styles.packageName, 
                        selectedBol?._id === bol._id ? styles.selectedText : styles.unselectedText
                      ]}>
                        {displayBol.packageName}
                      </Text>
                    </View>
                    <View style={styles.bolDetails}>
                      <Text style={[
                        styles.bolDetailText, 
                        selectedBol?._id === bol._id ? styles.selectedText : styles.unselectedText
                      ]}>
                        📍 {displayBol.location}
                      </Text>
                      <Text style={[
                        styles.bolDetailText, 
                        selectedBol?._id === bol._id ? styles.selectedText : styles.unselectedText
                      ]}>
                        📅 {displayBol.date}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                BOL: {selectedBol ? (selectedBol.probarcode || `BOL-${selectedBol._id?.slice(-6)}`) : 'No BOL Selected'}
              </Text>
            </View>
          </View>

          {/* Chat Area */}
          <ScrollView 
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
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
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Input Area */}
          {waitingForInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder={`Enter the new value for ${currentField}...`}
                onSubmitEditing={() => handleTextInput(messageInput)}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => handleTextInput(messageInput)}
                disabled={!messageInput.trim()}
                style={[styles.sendButton, !messageInput.trim() && styles.disabledButton]}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Bar */}
          {!waitingForInput && (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>
                {conversation.length > 0 ? 'BOLy is ready to help!' : 'Initializing conversation...'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 320,
    backgroundColor: '#1f2937',
    zIndex: 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    color: '#9ca3af',
    fontSize: 18,
  },
  bolList: {
    padding: 16,
  },
  bolItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedBol: {
    backgroundColor: '#4f46e5',
  },
  unselectedBol: {
    backgroundColor: '#374151',
  },
  selectedText: {
    color: 'white',
  },
  unselectedText: {
    color: '#d1d5db',
  },
  bolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  packageName: {
    fontWeight: '600',
    fontSize: 14,
  },
  bolDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bolDetailText: {
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  menuIcon: {
    color: 'white',
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
    borderRadius: 8,
    borderBottomRightRadius: 0,
    maxWidth: '70%',
  },
  botMessage: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
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
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    color: '#2563eb',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
  },
  statusBar: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusText: {
    color: '#6b7280',
    fontSize: 14,
  },
});