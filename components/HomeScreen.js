import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [bols, setBols] = useState([
    { id: 1, date: '2025-06-10', location: 'Delhi', packageName: 'BOL2024-IND-00045' },
    { id: 2, date: '2025-06-09', location: 'Mumbai', packageName: 'BOL2024-IND-00046' },
    { id: 3, date: '2025-06-08', location: 'Chennai', packageName: 'BOL2024-IND-00047' },
    { id: 4, date: '2025-06-07', location: 'Kolkata', packageName: 'BOL2024-IND-00048' },
    { id: 5, date: '2025-06-06', location: 'Hyderabad', packageName: 'BOL2024-IND-00049' },
    { id: 6, date: '2025-06-05', location: 'Pune', packageName: 'BOL2024-IND-00050' },
    { id: 7, date: '2025-06-04', location: 'Ahmedabad', packageName: 'BOL2024-IND-00051' },
    { id: 8, date: '2025-06-03', location: 'Jaipur', packageName: 'BOL2024-IND-00052' },
    { id: 9, date: '2025-06-02', location: 'Lucknow', packageName: 'BOL2024-IND-00053' },
    { id: 10, date: '2025-06-01', location: 'Bhopal', packageName: 'BOL2024-IND-00054' },
    { id: 11, date: '2025-05-31', location: 'Nagpur', packageName: 'BOL2024-IND-00055' },
    { id: 12, date: '2025-05-30', location: 'Chandigarh', packageName: 'BOL2024-IND-00056' },
    { id: 13, date: '2025-05-29', location: 'Goa', packageName: 'BOL2024-IND-00057' },
    { id: 14, date: '2025-05-28', location: 'Surat', packageName: 'BOL2024-IND-00058' },
    { id: 15, date: '2025-05-27', location: 'Patna', packageName: 'BOL2024-IND-00059' },
    { id: 16, date: '2025-05-26', location: 'Indore', packageName: 'BOL2024-IND-00060' },
    { id: 17, date: '2025-05-25', location: 'Kanpur', packageName: 'BOL2024-IND-00061' },
    { id: 18, date: '2025-05-24', location: 'Ranchi', packageName: 'BOL2024-IND-00062' },
    { id: 19, date: '2025-05-23', location: 'Guwahati', packageName: 'BOL2024-IND-00063' },
    { id: 20, date: '2025-05-22', location: 'Dehradun', packageName: 'BOL2024-IND-00064' },
  ]);

  const [selectedBol, setSelectedBol] = useState(bols[0]);

  const [chat, setChat] = useState([
    { id: 1, role: 'bot', text: 'Hello, I am BOLy! how may I help you update the BOL?' },
    { id: 2, role: 'user', text: 'Yes I find weight should be 55Kgs not 50Kgs' },
    { id: 3, role: 'bot', text: 'Okay, Let me update the BOL central servers about this one' },
    { id: 4, role: 'bot', text: 'Do you find anything else to be updated?' },
    { id: 5, role: 'user', text: 'Yes, actually I also see that height is incorrect, it should be 5ft instead of 4ft' },
    { id: 6, role: 'bot', text: 'Sure, lets update the details, in the mean time check if any more updates are needed, until I get this one done!' },
    { id: 7, role: 'user', text: 'No, I think we are good for now...' },
  ]);
  const [messageInput, setMessageInput] = useState('');

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -width * 0.8 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.root}>
        <StatusBar style='dark' />
        <View style={styles.statusBar}></View>

        <View style={styles.body}>
          <LinearGradient
            style={styles.gradientContainer}
            colors={['#ffffff', '#f8f8ff']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            {/* Off-canvas menu */}
            <Animated.View
              style={[
                styles.drawerMenu,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <ScrollView contentContainerStyle={styles.drawerContent}>
                {bols.map((bol) => (
                  <TouchableOpacity key={bol.id} style={styles.drawerItem} onPress={() => { setSelectedBol(bol); toggleMenu(); }}>
                    <Text style={styles.drawerText}>📦 {bol.packageName}</Text>
                    <Text style={styles.drawerTextSmall}>📍 {bol.location} | 📅 {bol.date}</Text>
                  </TouchableOpacity>
                ))}

              </ScrollView>
            </Animated.View>

            {/* Top Bar */}
            <View style={styles.preGradientContainerBody}>
              <Text style={styles.menuHeader}>
                BOL: {selectedBol?.packageName}
              </Text>
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons name='menu' size={32} color='white' />
              </TouchableOpacity>
            </View>

            <View style={styles.gradientContainerBody}>
              <ScrollView contentContainerStyle={{ padding: 12 }}>
                {chat.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot
                    ]}
                  >
                    {msg.role === 'bot' && (
                      <Ionicons name="chatbox-ellipses" size={20} color="black" style={styles.icon} />
                    )}
                    <View style={[
                      styles.messageBubble,
                      msg.role === 'user' ? styles.userBubble : styles.botBubble
                    ]}>
                      <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                    {msg.role === 'user' && (
                      <Ionicons name="person-circle" size={20} color="black" style={styles.icon} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.postGradientContainerBody}>
              <View style={styles.messageArea}>
                <TextInput style={styles.messageBox}
                  multiline={true}
                  numberOfLines={10}
                  placeholder='Enter a message here'
                  placeholderTextColor="#999"
                  value={messageInput}
                  onChangeText={setMessageInput}
                >
                </TextInput>
                <TouchableOpacity style={styles.sendButton}
                  onPress={() => {
                    if (messageInput.trim() !== ' ') {
                      setChat(prev => [...prev, { id: Date.now(), role: 'user', text: messageInput }]);
                      setMessageInput('');
                    }
                  }}
                >
                  <Ionicons name='send' size={24} color='black'></Ionicons>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottom}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    width: '100%',
    height: '4.5%',
  },
  bottom: {
    width: '100%',
    height: '4.5%',
  },
  body: {
    width: '100%',
    height: '91%',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preGradientContainerBody: {
    width: '100%',
    height: '8%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  gradientContainerBody: {
    width: '100%',
    height: '80%'
  },
  postGradientContainerBody: {
    width: '100%',
    height: '12%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mexuTextBox: {
    width: '85%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuHeader: {
    fontSize: 20,
    overflow: 'scroll',
    color: 'white',
  },
  drawerMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#333',
    paddingTop: 10,
    zIndex: 10,
  },
  drawerContent: {
    alignItems: 'center',
    padding: 20,
  },
  messageArea: {
    height: '95%',
    width: '95%',
    backgroundColor: '#d1d5db',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageBox: {
    fontSize: 18,
    width: '75%',
    height: '100%',
    textAlignVertical: 'top'
  },
  sendButton: {
    height: '100%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageBubble: {
    maxWidth: '75%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    maxWidth: '90%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  icon: {
    marginHorizontal: 6,
    marginTop: 4
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 10,
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  drawerItem: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  drawerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerTextSmall: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 4,
  },
});
