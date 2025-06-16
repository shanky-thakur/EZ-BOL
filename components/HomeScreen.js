import React, { useState, useEffect } from 'react';
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

// Get the correct API URL for development
const getApiUrl = () => {
  if (__DEV__) {
    // For Expo development - this gets your computer's IP automatically
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    return `http://${debuggerHost}:3000`;
  }
  // For production, use your actual API URL
  return 'https://your-production-api.com';
};

const API_BASE_URL = getApiUrl();

export default function ChatInterface({ navigation, route }) {
  // Get phone number and BOL ID from route params
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';
  const bolId = route?.params?.bolId; // BOL ID should be passed from previous screen

  const [conversation, setConversation] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  
  // Fixed field arrays - removed duplicates, keeping original field names
  const [highlyErrorProne, setHighlyErrorProne] = useState([
    "shipperName", 
    "shipperPhoneNumber", 
    "consigneeName", 
    "consigneePhoneNumber", 
    "classOrDensity", 
    "Units", 
    "Weight"
  ]);
  
  const [midErrorProne, setMidErrorProne] = useState([
    "Dtae", 
    "nmfcCode", 
    "hazmat", 
    "kindOfPacking", 
    "amount"
  ]);
  
  const [stable, setStable] = useState([
    "proBarcode", 
    "shipperStreet", 
    "shipperCity", 
    "shipperNumber", 
    "consigneeStreet", 
    "consigneeCity", 
    "customerReferenceNumber", 
    "collectCheckBox", 
    "guranteedCheckBox", 
    "lbOrKgFlag", 
    "currencyFlag", 
    "authorizedSignature"
  ]);
  
  const [currentArray, setCurrentArray] = useState('highly'); // 'highly', 'mid', 'stable'
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Get current field from current array
  const getCurrentField = () => {
    switch (currentArray) {
      case 'highly':
        return highlyErrorProne[0] || null;
      case 'mid':
        return midErrorProne[0] || null;
      case 'stable':
        return stable[0] || null;
      default:
        return null;
    }
  };

  // Get current array name for display
  const getCurrentArrayName = () => {
    switch (currentArray) {
      case 'highly':
        return 'Highly Error Prone Fields';
      case 'mid':
        return 'Moderately Error Prone Fields';
      case 'stable':
        return 'Stable Fields';
      default:
        return '';
    }
  };

  // Move to next array
  const moveToNextArray = () => {
    console.log(`Moving from ${currentArray} array`);
    if (currentArray === 'highly') {
      console.log(`Moving to mid array. Mid array length: ${midErrorProne.length}`);
      setCurrentArray('mid');
      return true;
    } else if (currentArray === 'mid') {
      console.log(`Moving to stable array. Stable array length: ${stable.length}`);
      setCurrentArray('stable');
      return true;
    }
    console.log('No more arrays to move to');
    return false; // No more arrays
  };

  // Remove field from current array
  const removeCurrentField = () => {
    console.log(`Removing field from ${currentArray} array`);
    switch (currentArray) {
      case 'highly':
        console.log(`Highly error prone before removal: ${highlyErrorProne.length}`);
        setHighlyErrorProne(prev => {
          const newArray = prev.slice(1);
          console.log(`Highly error prone after removal: ${newArray.length}`);
          return newArray;
        });
        break;
      case 'mid':
        console.log(`Mid error prone before removal: ${midErrorProne.length}`);
        setMidErrorProne(prev => {
          const newArray = prev.slice(1);
          console.log(`Mid error prone after removal: ${newArray.length}`);
          return newArray;
        });
        break;
      case 'stable':
        console.log(`Stable before removal: ${stable.length}`);
        setStable(prev => {
          const newArray = prev.slice(1);
          console.log(`Stable after removal: ${newArray.length}`);
          return newArray;
        });
        break;
    }
  };

  // Check if current array is empty
  const isCurrentArrayEmpty = () => {
    switch (currentArray) {
      case 'highly':
        return highlyErrorProne.length === 0;
      case 'mid':
        return midErrorProne.length === 0;
      case 'stable':
        return stable.length === 0;
      default:
        return true;
    }
  };

  // Check if all arrays are empty
  const areAllArraysEmpty = () => {
    return highlyErrorProne.length === 0 && midErrorProne.length === 0 && stable.length === 0;
  };

  // API call to update BOL field
  const updateBOLField = async (field, value) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/bol/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bolId,
          update: { [field]: value }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: `Updated ${field} successfully` };
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field update process
  const handleFieldUpdate = async (value) => {
    if (!value.trim()) return;

    const field = getCurrentField();
    if (!field) {
      console.log('No current field available');
      return;
    }
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: value
    };
    
    setConversation(prev => [...prev, userMessage]);
    setWaitingForInput(false);
    setMessageInput('');
    setAwaitingResponse(true);

    // Call API to update field
    const result = await updateBOLField(field, value);
    
    // Add bot response about update status
    const updateResponse = {
      id: Date.now() + 1,
      role: 'bot',
      text: result.success ? 
        `✅ ${result.message}` : 
        `❌ Failed to update ${field}: ${result.message}`,
      options: null
    };

    setConversation(prev => [...prev, updateResponse]);

    if (result.success) {
      // Remove the updated field from array
      removeCurrentField();
      
      setTimeout(() => {
        askNextField();
      }, 1000);
    } else {
      // If update failed, ask if they want to try again
      setTimeout(() => {
        const retryMessage = {
          id: Date.now() + 2,
          role: 'bot',
          text: `Would you like to try updating "${field}" again?`,
          options: ['Yes, try again', 'No, skip this field']
        };
        setConversation(prev => [...prev, retryMessage]);
        setAwaitingResponse(false);
      }, 1000);
    }
  };

  // Ask about next field
  const askNextField = () => {
    console.log(`askNextField called. Current array: ${currentArray}`);
    console.log(`Array lengths - Highly: ${highlyErrorProne.length}, Mid: ${midErrorProne.length}, Stable: ${stable.length}`);
    
    // Check if all arrays are completed
    if (areAllArraysEmpty()) {
      console.log('All arrays are empty - session completed');
      const completionMessage = {
        id: Date.now(),
        role: 'bot',
        text: '🎉 All field updates have been completed! Your BOL has been successfully updated.',
        options: ['Start New Session', 'Exit']
      };
      setConversation(prev => [...prev, completionMessage]);
      setSessionCompleted(true);
      setAwaitingResponse(false);
      return;
    }

    // Check if current array is empty
    if (isCurrentArrayEmpty()) {
      console.log(`Current array ${currentArray} is empty`);
      // Try to move to next array
      const movedToNext = moveToNextArray();
      
      if (!movedToNext) {
        console.log('Could not move to next array - session completed');
        // All arrays completed
        const completionMessage = {
          id: Date.now(),
          role: 'bot',
          text: '🎉 All field updates have been completed! Your BOL has been successfully updated.',
          options: ['Start New Session', 'Exit']
        };
        setConversation(prev => [...prev, completionMessage]);
        setSessionCompleted(true);
        setAwaitingResponse(false);
        return;
      } else {
        console.log(`Moved to next array: ${currentArray}`);
        // Moved to next array, show transition message
        const transitionMessage = {
          id: Date.now(),
          role: 'bot',
          text: `Moving to ${getCurrentArrayName()}. Let's continue with the updates.`,
          options: null
        };
        setConversation(prev => [...prev, transitionMessage]);
        
        setTimeout(() => {
          askNextField();
        }, 1500);
        return;
      }
    }

    // Ask about current field
    const field = getCurrentField();
    if (!field) {
      console.log('No current field available, but array not empty - this should not happen');
      return;
    }

    console.log(`Asking about field: ${field}`);
    const fieldMessage = {
      id: Date.now(),
      role: 'bot',
      text: `Do you want to update "${field}"?\n\nCurrently in: ${getCurrentArrayName()}`,
      options: ['Yes', 'No']
    };
    
    setConversation(prev => [...prev, fieldMessage]);
    setAwaitingResponse(false);
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (sessionCompleted) {
      if (option === 'Start New Session') {
        // Reset all states with original field arrays
        setHighlyErrorProne([
          "shipperName", 
          "shipperPhoneNumber", 
          "consigneeName", 
          "consigneePhoneNumber", 
          "classOrDensity", 
          "Units", 
          "Weight"
        ]);
        setMidErrorProne([
          "Dtae", 
          "nmfcCode", 
          "hazmat", 
          "kindOfPacking", 
          "amount"
        ]);
        setStable([
          "proBarcode", 
          "shipperStreet", 
          "shipperCity", 
          "shipperNumber", 
          "consigneeStreet", 
          "consigneeCity", 
          "customerReferenceNumber", 
          "collectCheckBox", 
          "guranteedCheckBox", 
          "lbOrKgFlag", 
          "currencyFlag", 
          "authorizedSignature"
        ]);
        setCurrentArray('highly');
        setSessionCompleted(false);
        setConversation([]);
        
        setTimeout(() => {
          initializeChat();
        }, 500);
        return;
      } else if (option === 'Exit') {
        navigation.goBack();
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: option
    };

    // Remove options from last bot message
    setConversation(prev => {
      const newConversation = [...prev];
      if (newConversation.length > 0) {
        newConversation[newConversation.length - 1] = {
          ...newConversation[newConversation.length - 1],
          options: null
        };
      }
      return [...newConversation, userMessage];
    });

    setAwaitingResponse(true);

    if (option === 'Yes') {
      // Show input field for the current field
      const field = getCurrentField();
      if (!field) {
        console.log('No field available for input');
        return;
      }
      
      setCurrentField(field);
      setWaitingForInput(true);
      
      const inputMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Please enter the new value for "${field}":`,
        options: null
      };
      
      setTimeout(() => {
        setConversation(prev => [...prev, inputMessage]);
        setAwaitingResponse(false);
      }, 1000);
      
    } else if (option === 'No') {
      // Skip current field and move to next
      const currentFieldName = getCurrentField();
      removeCurrentField();
      
      const skipMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Skipped "${currentFieldName}". Moving to next field.`,
        options: null
      };
      
      setTimeout(() => {
        setConversation(prev => [...prev, skipMessage]);
        setTimeout(() => {
          askNextField();
        }, 1000);
      }, 1000);
      
    } else if (option === 'Yes, try again') {
      // Try updating the same field again
      const field = getCurrentField();
      if (!field) {
        console.log('No field available for retry');
        return;
      }
      
      setCurrentField(field);
      setWaitingForInput(true);
      
      const retryMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Please enter the new value for "${field}" again:`,
        options: null
      };
      
      setTimeout(() => {
        setConversation(prev => [...prev, retryMessage]);
        setAwaitingResponse(false);
      }, 1000);
      
    } else if (option === 'No, skip this field') {
      // Skip the failed field and move to next
      const currentFieldName = getCurrentField();
      removeCurrentField();
      
      const skipMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Skipped the failed field "${currentFieldName}". Moving to next field.`,
        options: null
      };
      
      setTimeout(() => {
        setConversation(prev => [...prev, skipMessage]);
        setTimeout(() => {
          askNextField();
        }, 1000);
      }, 1000);
    }
  };

  // Initialize chat
  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      role: 'bot',
      text: `Hello! I'm BOLy, your BOL update assistant for ${phoneNumber}.\n\nI'll help you update your BOL fields systematically. We'll start with the most error-prone fields first.`,
      options: null
    };
    
    setConversation([welcomeMessage]);
    
    setTimeout(() => {
      askNextField();
    }, 2000);
  };

  // Initialize conversation and handle back button
  useEffect(() => {
    if (!bolId) {
      Alert.alert('Error', 'BOL ID is required', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    setTimeout(() => {
      initializeChat();
    }, 500);

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [bolId, phoneNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>BOL Update Assistant</Text>
              <Text style={styles.headerSubtitle}>BOLy - Field Update Chat</Text>
            </View>
          </View>

          {/* Info Bar */}
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              📱 {phoneNumber} • 🤖 BOLy Assistant • 📝 BOL: {bolId}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Text style={styles.progressText}>
              Current: {getCurrentArrayName()} • 
              Remaining: H:{highlyErrorProne.length} M:{midErrorProne.length} S:{stable.length}
            </Text>
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
                      {isLoading ? 'Updating BOL...' : 'BOLy is typing...'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          {waitingForInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder={`Enter value for ${currentField}...`}
                onSubmitEditing={() => handleFieldUpdate(messageInput)}
                autoFocus
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => handleFieldUpdate(messageInput)}
                disabled={!messageInput.trim() || isLoading}
                style={[styles.sendButton, (!messageInput.trim() || isLoading) && styles.disabledButton]}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? '...' : '➤'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Status Bar */}
          {!waitingForInput && (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>
                {sessionCompleted ? 'Session completed!' : 
                 conversation.length > 0 ? 'BOLy is ready to help!' : 'Loading conversation...'}
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