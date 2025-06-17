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

export default function ChatInterface({ navigation, route }) {
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';
  const bolId = route?.params?.bolId;

  const conversationRef = useRef([]);
  const [conversation, setConversation] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

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
  const [currentArray, setCurrentArray] = useState('highly');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);

  const scrollViewRef = useRef(null);

  const appendMessage = useCallback((msg) => {
    conversationRef.current = [...conversationRef.current, msg];
    setConversation([...conversationRef.current]);
  }, []);

  const getArrayByName = useCallback((arrayName) => {
    switch (arrayName) {
      case 'highly': return highlyErrorProne;
      case 'mid': return midErrorProne;
      case 'stable': return stable;
      default: return [];
    }
  }, [highlyErrorProne, midErrorProne, stable]);

  const getCurrentArrayName = useCallback(() => {
    switch (currentArray) {
      case 'highly': return 'Highly Error Prone Fields';
      case 'mid': return 'Moderately Error Prone Fields';
      case 'stable': return 'Stable Fields';
      default: return '';
    }
  }, [currentArray]);

  const findNextAvailableArray = useCallback(() => {
    if (currentArray === 'highly' && midErrorProne.length > 0) {
      return 'mid';
    } else if ((currentArray === 'highly' || currentArray === 'mid') && stable.length > 0) {
      return 'stable';
    }
    return null;
  }, [currentArray, midErrorProne.length, stable.length]);

  const areAllArraysEmpty = useCallback((arrays = null) => {
    const currentArrays = arrays || {
      highly: highlyErrorProne,
      mid: midErrorProne,
      stable: stable
    };
    return currentArrays.highly.length === 0 &&
           currentArrays.mid.length === 0 &&
           currentArrays.stable.length === 0;
  }, [highlyErrorProne, midErrorProne, stable]);

  // --- Multi-field selection prompt ---
  const promptFieldsInGroup = useCallback(() => {
    const fields = getArrayByName(currentArray);
    if (!fields.length) {
      // Move to next array if this one is empty
      const nextArray = findNextAvailableArray();
      if (nextArray) {
        setCurrentArray(nextArray);
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `Moving to ${nextArray === 'mid' ? 'Moderately Error Prone Fields' : 'Stable Fields'}. Let's continue with the updates.`,
          options: null
        });
        return;
      } else {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: '🎉 All field updates have been completed! Your BOL has been successfully updated.',
          options: ['Start New Session', 'Exit']
        });
        setSessionCompleted(true);
        setAwaitingResponse(false);
        return;
      }
    }
    // Present all fields as options, plus a "No changes in this group" option
    appendMessage({
      id: uuid.v4(),
      role: 'bot',
      text: `Which field would you like to update next in ${getCurrentArrayName()}?`,
      options: [...fields, 'No changes in this group']
    });
    setAwaitingResponse(false);
  }, [currentArray, getArrayByName, getCurrentArrayName, findNextAvailableArray, appendMessage]);

  // --- Effect: prompt fields whenever array changes ---
  useEffect(() => {
    if (!sessionCompleted && !awaitingResponse && !waitingForInput) {
      promptFieldsInGroup();
    }
  }, [highlyErrorProne, midErrorProne, stable, currentArray, sessionCompleted, awaitingResponse, waitingForInput, promptFieldsInGroup]);

  // --- Handle user selecting a field or "No changes" ---
  const handleOptionSelect = (option) => {
    if (sessionCompleted) {
      if (option === 'Start New Session') {
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
        conversationRef.current = [];
        setConversation([]);
        setWelcomeShown(false);
        setTimeout(() => {
          initializeChat();
        }, 500);
        return;
      } else if (option === 'Exit') {
        navigation.goBack();
        return;
      }
    }

    appendMessage({
      id: uuid.v4(),
      role: 'user',
      text: option
    });
    setAwaitingResponse(true);

    const fields = getArrayByName(currentArray);

    if (option === 'No changes in this group') {
      // Clear current array and let effect move to next group
      if (currentArray === 'highly') setHighlyErrorProne([]);
      else if (currentArray === 'mid') setMidErrorProne([]);
      else if (currentArray === 'stable') setStable([]);
      setAwaitingResponse(false);
      return;
    }

    if (!fields.includes(option)) return;

    setCurrentField(option);
    setWaitingForInput(true);
    setTimeout(() => {
      appendMessage({
        id: uuid.v4(),
        role: 'bot',
        text: `Please enter the new value for "${option}":`,
        options: null
      });
      setAwaitingResponse(false);
    }, 400);
  };

  // --- Handle field update and repeat field selection ---
  const updateBOLField = async (field, value) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/bol/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bolId, update: { [field]: value } }),
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

  const handleFieldUpdate = async (value) => {
    if (!value.trim()) return;
    const field = currentField;
    if (!field) return;
    appendMessage({
      id: uuid.v4(),
      role: 'user',
      text: value
    });
    setWaitingForInput(false);
    setMessageInput('');
    setAwaitingResponse(true);
    const result = await updateBOLField(field, value);
    appendMessage({
      id: uuid.v4(),
      role: 'bot',
      text: result.success ?
        `✅ ${result.message}` :
        `❌ Failed to update ${field}: ${result.message}`,
      options: null
    });
    if (result.success) {
      setTimeout(() => {
        // Remove field from current array and re-prompt
        if (currentArray === 'highly') setHighlyErrorProne(arr => arr.filter(f => f !== field));
        else if (currentArray === 'mid') setMidErrorProne(arr => arr.filter(f => f !== field));
        else if (currentArray === 'stable') setStable(arr => arr.filter(f => f !== field));
        setAwaitingResponse(false);
      }, 800);
    } else {
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `Would you like to try updating "${field}" again?`,
          options: ['Yes, try again', 'No, skip this field']
        });
        setAwaitingResponse(false);
      }, 800);
    }
  };

  // --- Handle retry/skip after failed update ---
  useEffect(() => {
    if (!waitingForInput && !awaitingResponse && !sessionCompleted) {
      // If the last bot message is a retry/skip prompt, handle accordingly
      const lastBot = conversation[conversation.length - 1];
      if (lastBot && lastBot.role === 'bot' && lastBot.options && lastBot.options[0] === 'Yes, try again') {
        // Wait for user to pick an option
      }
    }
  }, [conversation, waitingForInput, awaitingResponse, sessionCompleted]);

  // --- Handle retry/skip option selection ---
  const handleRetryOrSkip = (option) => {
    appendMessage({
      id: uuid.v4(),
      role: 'user',
      text: option
    });
    setAwaitingResponse(true);
    if (option === 'Yes, try again') {
      setWaitingForInput(true);
      setTimeout(() => {
        appendMessage({
          id: uuid.v4(),
          role: 'bot',
          text: `Please enter the new value for "${currentField}" again:`,
          options: null
        });
        setAwaitingResponse(false);
      }, 400);
    } else if (option === 'No, skip this field') {
      setTimeout(() => {
        // Remove field from current array and re-prompt
        if (currentArray === 'highly') setHighlyErrorProne(arr => arr.filter(f => f !== currentField));
        else if (currentArray === 'mid') setMidErrorProne(arr => arr.filter(f => f !== currentField));
        else if (currentArray === 'stable') setStable(arr => arr.filter(f => f !== currentField));
        setAwaitingResponse(false);
      }, 400);
    }
  };

  // --- Only call initializeChat ONCE on mount (not on every update) ---
  const initializeChat = useCallback(() => {
    if (welcomeShown) return;
    setWelcomeShown(true);
    appendMessage({
      id: uuid.v4(),
      role: 'bot',
      text: `Hello! I'm BOLy, your BOL update assistant for ${phoneNumber}.\n\nI'll help you update your BOL fields systematically. We'll start with the most error-prone fields first.`,
      options: null
    });
    setTimeout(() => {
      promptFieldsInGroup();
    }, 500);
  }, [phoneNumber, promptFieldsInGroup, appendMessage, welcomeShown]);

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
              <Text style={styles.headerSubtitle}>BOLy - Field Update Chat</Text>
            </View>
          </View>
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              📱 {phoneNumber} • 🤖 BOLy Assistant • 📝 BOL: {bolId}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Text style={styles.progressText}>
              Current: {getCurrentArrayName()} •
              Remaining: H:{highlyErrorProne.length} M:{midErrorProne.length} S:{stable.length}
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
                    {msg.options.map((option, index) => {
                      // Special case: retry/skip options after a failed update
                      if (msg.options[0] === 'Yes, try again') {
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleRetryOrSkip(option)}
                            style={styles.optionButton}
                            disabled={isLoading}
                          >
                            <Text style={styles.optionText}>{option}</Text>
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleOptionSelect(option)}
                          style={styles.optionButton}
                          disabled={isLoading}
                        >
                          <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                      );
                    })}
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
                blurOnSubmit={false}
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
