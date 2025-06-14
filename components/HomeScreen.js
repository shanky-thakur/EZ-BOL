import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function BOLChatInterface() {
  const [bols, setBols] = useState([
    { id: 1, date: '2025-06-10', location: 'Delhi', packageName: 'BOL2024-IND-00045', status: 'pending' },
    { id: 2, date: '2025-06-09', location: 'Mumbai', packageName: 'BOL2024-IND-00046', status: 'pending' },
    { id: 3, date: '2025-06-08', location: 'Chennai', packageName: 'BOL2024-IND-00047', status: 'pending' },
    { id: 4, date: '2025-06-07', location: 'Kolkata', packageName: 'BOL2024-IND-00048', status: 'pending' },
    { id: 5, date: '2025-06-06', location: 'Hyderabad', packageName: 'BOL2024-IND-00049', status: 'pending' },
    { id: 6, date: '2025-06-05', location: 'Pune', packageName: 'BOL2024-IND-00050', status: 'pending' },
    { id: 7, date: '2025-06-04', location: 'Ahmedabad', packageName: 'BOL2024-IND-00051', status: 'pending' },
    { id: 8, date: '2025-06-03', location: 'Jaipur', packageName: 'BOL2024-IND-00052', status: 'pending' },
    { id: 9, date: '2025-06-02', location: 'Lucknow', packageName: 'BOL2024-IND-00053', status: 'pending' },
    { id: 10, date: '2025-06-01', location: 'Bhopal', packageName: 'BOL2024-IND-00054', status: 'pending' },
  ]);

  const [selectedBol, setSelectedBol] = useState(bols[0]);
  const [conversationStep, setConversationStep] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputType, setInputType] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  // Same conversation flow logic as before
  const conversationFlow = [
    {
      type: 'bot',
      text: `Hello! I'm BOLy, your logistics assistant. Are you ready to pick up ${selectedBol?.packageName} from ${selectedBol?.location}?`,
      options: ['Yes', 'No']
    },
    {
      type: 'bot',
      text: 'Great! Before we proceed, please confirm the package details. Is the weight listed as 50 Kgs correct?',
      options: ['Yes, correct', 'No, needs update']
    },
    {
      type: 'bot',
      text: 'Perfect! Is the pickup location confirmed as the address on file?',
      options: ['Yes, confirmed', 'No, address changed']
    },
    {
      type: 'bot',
      text: 'Excellent! Your pickup is scheduled. Do you need any special handling instructions?',
      options: ['No special requirements', 'Yes, fragile items', 'Yes, temperature sensitive']
    },
    {
      type: 'bot',
      text: `All set! Your pickup for ${selectedBol?.packageName} is confirmed. You'll receive a tracking number shortly. Anything else I can help with?`,
      options: ['No, thank you', 'Yes, I have questions']
    }
  ];

  // Rest of your logic methods remain the same...
  const getAlternativeFlow = (step, response) => {
    switch (step) {
      case 0:
        if (response === 'No') {
          return {
            type: 'bot',
            text: 'No problem! When would you like to schedule the pickup?',
            options: ['Today', 'Tomorrow', 'Next week']
          };
        }
        break;
      case 1:
        if (response === 'No, needs update') {
          setWaitingForInput(true);
          setInputType('weight');
          return {
            type: 'bot',
            text: 'I understand. Please type the correct weight below and I\'ll update it for you.',
            options: null,
            requiresInput: true
          };
        }
        break;
      case 2:
        if (response === 'No, address changed') {
          setWaitingForInput(true);
          setInputType('address');
          return {
            type: 'bot',
            text: 'Got it! Please type the new pickup address below and I\'ll update it in the system.',
            options: null,
            requiresInput: true
          };
        }
        break;
      default:
        return conversationFlow[step + 1];
    }
    return conversationFlow[step + 1];
  };

  const handleTextInput = (inputText) => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: inputText
    };

    let botResponse;
    switch (inputType) {
      case 'weight':
        botResponse = {
          id: Date.now() + 1,
          role: 'bot',
          text: `Perfect! I've updated the weight to ${inputText}. The system has been notified. Now, is the pickup location confirmed as the address on file?`,
          options: ['Yes, confirmed', 'No, address changed']
        };
        break;
      case 'address':
        botResponse = {
          id: Date.now() + 1,
          role: 'bot',
          text: `Great! I've updated the pickup address to: ${inputText}. The system has been updated. Now, do you need any special handling instructions?`,
          options: ['No special requirements', 'Yes, fragile items', 'Yes, temperature sensitive']
        };
        break;
      default:
        botResponse = {
          id: Date.now() + 1,
          role: 'bot',
          text: `Thank you for the information: ${inputText}. Let me continue with the next step.`,
          options: ['Continue']
        };
    }

    setConversation(prev => [...prev, userMessage]);
    setWaitingForInput(false);
    setInputType('');
    setMessageInput('');
    setAwaitingResponse(true);

    setTimeout(() => {
      setConversation(prev => [...prev, botResponse]);
      setAwaitingResponse(false);
      if (inputType === 'weight') {
        setConversationStep(2);
      } else if (inputType === 'address') {
        setConversationStep(3);
      }
    }, 1500);
  };

  const handleOptionSelect = (option) => {
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: option
    };

    const nextStep = conversationStep + 1;
    let nextBotMessage;

    const alternativeResponse = getAlternativeFlow(conversationStep, option);
    if (alternativeResponse) {
      nextBotMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: alternativeResponse.text,
        options: alternativeResponse.options,
        requiresInput: alternativeResponse.requiresInput
      };
    } else if (nextStep < conversationFlow.length) {
      nextBotMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: conversationFlow[nextStep].text,
        options: conversationFlow[nextStep].options
      };
    }

    setConversation(prev => {
      const newConversation = [...prev];
      if (newConversation.length > 0) {
        newConversation[newConversation.length - 1] = {
          ...newConversation[newConversation.length - 1],
          options: null
        };
      }
      
      newConversation.push(userMessage);
      
      if (nextBotMessage && !nextBotMessage.requiresInput) {
        setTimeout(() => {
          setConversation(prev => [...prev, nextBotMessage]);
        }, 1000);
      } else if (nextBotMessage && nextBotMessage.requiresInput) {
        setTimeout(() => {
          setConversation(prev => [...prev, nextBotMessage]);
        }, 1000);
      }
      
      return newConversation;
    });

    if (!alternativeResponse || !alternativeResponse.requiresInput) {
      setConversationStep(nextStep);
    }
  };

  useEffect(() => {
    setConversation([]);
    setConversationStep(0);
    setWaitingForInput(false);
    setAwaitingResponse(false);
    
    setTimeout(() => {
      const initialMessage = {
        id: Date.now(),
        role: 'bot',
        text: conversationFlow[0].text,
        options: conversationFlow[0].options
      };
      setConversation([initialMessage]);
    }, 500);
  }, [selectedBol]);

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
              {bols.map((bol) => (
                <TouchableOpacity
                  key={bol.id}
                  onPress={() => {
                    setSelectedBol(bol);
                    setMenuVisible(false);
                  }}
                  style={[
                    styles.bolItem,
                    selectedBol?.id === bol.id ? styles.selectedBol : styles.unselectedBol
                  ]}
                >
                  <View style={styles.bolHeader}>
                    <Text style={styles.packageIcon}>📦</Text>
                    <Text style={[styles.packageName, selectedBol?.id === bol.id ? styles.selectedText : styles.unselectedText]}>
                      {bol.packageName}
                    </Text>
                  </View>
                  <View style={styles.bolDetails}>
                    <Text style={[styles.bolDetailText, selectedBol?.id === bol.id ? styles.selectedText : styles.unselectedText]}>
                      📍 {bol.location}
                    </Text>
                    <Text style={[styles.bolDetailText, selectedBol?.id === bol.id ? styles.selectedText : styles.unselectedText]}>
                      📅 {bol.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
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
            <Text style={styles.headerTitle}>BOL: {selectedBol?.packageName}</Text>
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
                placeholder={`Enter the correct ${inputType}...`}
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
                {conversation.length > 0 ? 'BOLy is ready to help!' : 'Loading conversation...'}
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
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom to prevent overlap
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Extra padding for home indicator
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Extra padding for home indicator
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