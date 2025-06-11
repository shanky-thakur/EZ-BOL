import { StatusBar } from 'expo-status-bar';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from 'react';

export default function App() {
  const scaleAnimation = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* status bar layout */}
      <StatusBar style='dark' ></StatusBar>
      <View style={styles.statusBar}></View>

      {/* main body content */}
      <View style={styles.body}>
        <LinearGradient style={styles.gradientContainer}
          colors={['#ffffff', '#f8f8ff']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.gradientContainerBody}>
            <Animated.Image
              source={require('./assets/EZ_BOL-removebg-preview.png')}
              style={{ transform: [{ scale: scaleAnimation }] }}
              resizeMode="cover"></Animated.Image>
          </View>
        </LinearGradient>
      </View>

      {/* android naviagtion layout */}
      <View style={styles.bottom}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBar: {
    width: '100%',
    height: '4.5%',
  },
  body: {
    width: '100%',
    height: '90%'
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottom: {
    width: '100%',
    height: '5.5%',
  },
  gradientContainerBody: {
    width: '55%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});