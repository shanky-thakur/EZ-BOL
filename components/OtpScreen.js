import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function OTPScreen({ navigation, route }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Get phone number from previous screen (if passed)
    const phoneNumber = route?.params?.phoneNumber || '+91 9876543210';

    useEffect(() => {
        // Timer countdown
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (value, index) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all fields are filled
        if (newOtp.every(digit => digit !== '') && value) {
            handleVerifyOtp(newOtp);
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = (otpArray = otp) => {
        const otpCode = otpArray.join('');
        
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter complete 6-digit OTP');
            return;
        }
        
        // Simulate OTP verification
        if (otpCode === '123456') {
            Alert.alert('Success', 'OTP verified successfully!', [
                { text: 'OK', onPress: () => navigation.replace('Home') }
            ]);
        } else {
            Alert.alert('Error', 'Invalid OTP. Please try again.');
            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResendOtp = () => {
        if (!canResend) return;
        
        // Reset timer
        setTimer(30);
        setCanResend(false);
        
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number.');

        // Restart timer
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                    <View style={styles.otpBox}>
                        <View style={styles.back}>
                            <View style={styles.icon}>
                                <TouchableOpacity 
                                    style={styles.backIcon} 
                                    onPress={() => navigation.replace('Phone')}
                                >
                                    <Ionicons name='arrow-back' color='black' size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.emptyArea}></View>
                        </View>

                        <View style={styles.formArea}>
                            <View style={styles.textArea}>
                                <Text style={styles.title}>Verify Phone Number</Text>
                                <Text style={styles.subtitle}>
                                    Enter the 6-digit code sent to
                                </Text>
                                <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                            </View>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => inputRefs.current[index] = ref}
                                        style={[
                                            styles.otpInput,
                                            digit ? styles.otpInputFilled : styles.otpInputEmpty
                                        ]}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        textAlign="center"
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>
                                    Didn't receive the code?{' '}
                                </Text>
                                <TouchableOpacity 
                                    onPress={handleResendOtp}
                                    disabled={!canResend}
                                >
                                    <Text style={[
                                        styles.resendButton,
                                        canResend ? styles.resendButtonActive : styles.resendButtonDisabled
                                    ]}>
                                        {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.lowerBox}>
                        <View style={styles.buttonEmptyBox}></View>
                        <View style={styles.buttonBox}>
                            <TouchableOpacity 
                                style={[
                                    styles.customeButton, 
                                    { opacity: otp.every(digit => digit !== '') ? 1 : 0.5 }
                                ]} 
                                onPress={() => handleVerifyOtp()}
                                disabled={!otp.every(digit => digit !== '')}
                            >
                                <Text style={styles.buttonText}>Verify OTP</Text>
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
    otpBox: {
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
        fontSize: 17,
        fontWeight: '600'
    },
    back: {
        width: '90%',
        height: '15%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    formArea: {
        width: '90%',
        height: '85%',
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
    textArea: {
        width: '100%',
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 4
    },
    phoneNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center'
    },
    otpContainer: {
        width: '100%',
        height: '25%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 8,
        fontSize: 18,
        fontWeight: '600',
        backgroundColor: '#ffffff'
    },
    otpInputEmpty: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        color: '#000000'
    },
    otpInputFilled: {
        borderWidth: 2,
        borderColor: '#000000',
        color: '#000000'
    },
    resendContainer: {
        width: '100%',
        height: '25%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    resendText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center'
    },
    resendButton: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center'
    },
    resendButtonActive: {
        color: '#000000'
    },
    resendButtonDisabled: {
        color: '#999999'
    }
});