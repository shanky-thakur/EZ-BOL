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
                {Array.from({ length: 30 }).map((_, i) => (
                  <Text key={i} style={styles.drawerItem}>
                    BOL2024-IND-00045
                  </Text>
                ))}
              </ScrollView>
            </Animated.View>


            {/* Top Bar */}
            <View style={styles.preGradientContainerBody}>
              <View style={styles.mexuTextBox}>
                <Text style={styles.menuHeader}>BOL2024-IND-00045</Text>
              </View>
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons name='menu' size={32} color='white' />
              </TouchableOpacity>
            </View>

            <View style={styles.gradientContainerBody}>
              <Text>Middle Section</Text>
            </View>

            <View style={styles.postGradientContainerBody}>
              <View style={styles.messageArea}>
                <TextInput style={styles.messageBox} 
                multiline={true}
                numberOfLines={10}
                placeholder='Enter a message here'
                placeholderTextColor="#999"

              >
              </TextInput>
              <TouchableOpacity style={styles.sendButton}>
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
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center'
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
  drawerItem: {
    color: 'white',
    fontSize: 18,
    marginVertical: 10,
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
  }
});
