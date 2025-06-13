import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from 'react-native-phone-number-input';
import { counterEvent } from 'react-native/Libraries/Performance/Systrace';

export default function PhoneNumber({ navigation }) {
    const phoneInput = useRef(null);
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');

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
                    <View style={styles.phoneBox}>
                        <View style={styles.back}>
                            <View style={styles.icon}>
                                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.replace('Splash')}>
                                    <Ionicons name='arrow-back' color='black' size={25} ></Ionicons>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.emptyArea}></View>
                        </View>

                        <View style={styles.formArea}>
                            <View style={styles.staticText}>
                                <Text style={styles.direction}>Enter your phone number</Text>
                            </View>

                            <View style={styles.pickerAndFormArea} >
                                <View style={styles.form}>
                                    <View style={styles.country}></View>
                                    <View style={styles.phone}></View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.lowerBox}>
                        <View style={styles.buttonEmptyBox}></View>

                        <View style={styles.buttonBox}>
                            <TouchableOpacity style={styles.customeButton} onPress={() => navigation.replace('Home')}>
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
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
        height: '91%'
    },
    bottom: {
        width: '100%',
        height: '4.5%',
    },
    phoneBox: {
        width: '95%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    lowerBox: {
        width: '95%',
        height: '58%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    gradientContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonEmptyBox: {
        width: '100%',
        height: '85%'
    },
    buttonBox: {
        width: '100%',
        height: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    customeButton: {
        width: '80%',
        height: '65%',
        borderRadius: 25,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 17
    },
    back: {
        width: '90%',
        height: '13%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    formArea: {
        width: '90%',
        height: '82%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: '10%',
        height: '100%'
    },
    backIcon: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyArea: {
        width: '90%',
        height: '100%'
    },
    staticText: {
        width: '100%',
        height: '25%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    direction: {
        color: '#00000',
        fontSize: 20
    },
    pickerAndFormArea: {
        width: '100%',
        height: '75%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    form: {
        width: '100%',
        height: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    country: {
        width: '25%',
        height: '100%',
        borderWidth: 1
    },
    phone: {
        width: '75%',
        height: '100%',
        borderWidth: 1
    }
});