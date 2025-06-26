import {
  useEffect,
  useRef
} from 'react';
import {
  Animated,
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
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
          <View style={styles.preGradientContainerBody}></View>
          <View style={styles.gradientContainerBody}>
            <Animated.Image
              source={require('../assets/EZ_BOL-removebg-preview.png')}
              resizeMode="cover"
              style={{ transform: [{ scale }] }}
            />
          </View>

          <View style={styles.postGradientContainerBody}>
            <TouchableOpacity style={styles.postGradientContainerBodyButton} onPress={() => navigation.replace('Phone')}>
              <Text style={styles.customButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.bottom}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
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
    alignItems: 'center'
  },
  bottom: {
    width: '100%',
    height: '4.5%',
  },
  gradientContainerBody: {
    width: '55%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  preGradientContainerBody: {
    width: '100%',
    height: '20%'
  },
  postGradientContainerBody: {
    width: '90%',
    height: '35%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column'
  },
  postGradientContainerBodyButton: {
    width: '85%',
    height: '15%',
    backgroundColor: '#333333',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  customButtonText: {
    color: '#fff',
    fontSize: 15
  }
});
