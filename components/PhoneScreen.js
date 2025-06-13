import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, FlatList, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Predefined countries with emoji flags
const COUNTRIES = [
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
    { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
];

export default function PhoneNumber({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to US
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleNext = () => {
        if (phoneNumber.length >= 7) {
            const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
            navigation.replace('Home');
        } else {
            alert('Please enter a valid phone number');
        }
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setShowCountryModal(false);
        setSearchText('');
    };

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchText.toLowerCase()) ||
        country.dialCode.includes(searchText)
    );

    const renderCountryItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                    setSearchText('');
                }}
                activeOpacity={0.7}
            >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryCode}>{item.dialCode}</Text>
            </TouchableOpacity>
        );
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
                    <View style={styles.phoneBox}>
                        <View style={styles.back}>
                            <View style={styles.icon}>
                                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.replace('Splash')}>
                                    <Ionicons name='arrow-back' color='black' size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.emptyArea}></View>
                        </View>

                        <View style={styles.formArea}>
                            <View style={styles.staticText}>
                                <Text style={styles.direction}>Enter your phone number</Text>
                            </View>

                            <View style={styles.pickerAndFormArea}>
                                <View style={styles.phoneInputContainer}>
                                    <View style={styles.phoneInputWrapper}>
                                        {/* Country Picker Button */}
                                        <TouchableOpacity 
                                            style={styles.countrySelector}
                                            onPress={() => setShowCountryModal(true)}
                                        >
                                            <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                                            <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
                                            <Ionicons name="chevron-down" size={16} color="#666" />
                                        </TouchableOpacity>

                                        {/* Phone Number Input */}
                                        <TextInput
                                            style={styles.phoneTextInput}
                                            placeholder="Phone number"
                                            placeholderTextColor="#999"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            maxLength={15}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.lowerBox}>
                        <View style={styles.buttonEmptyBox}></View>
                        <View style={styles.buttonBox}>
                            <TouchableOpacity 
                                style={[styles.customeButton, { opacity: phoneNumber.length > 0 ? 1 : 0.5 }]} 
                                onPress={handleNext}
                                disabled={phoneNumber.length === 0}
                            >
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.bottom}></View>

            {/* Country Picker Modal */}
            <Modal
                visible={showCountryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCountryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <SafeAreaView style={styles.modalSafeArea}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Country</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowCountryModal(false)}
                                >
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            {/* Search Input */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search countries..."
                                    placeholderTextColor="#999"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>

                            {/* Countries List */}
                            <FlatList
                                data={filteredCountries}
                                keyExtractor={(item) => item.code}
                                renderItem={renderCountryItem}
                                style={styles.countriesList}
                                showsVerticalScrollIndicator={false}
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="handled"
                            />
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>
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
        color: '#000000',
        fontSize: 20
    },
    pickerAndFormArea: {
        width: '100%',
        height: '75%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    phoneInputContainer: {
        width: '100%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    phoneInputWrapper: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        paddingHorizontal: 12
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        minWidth: 100
    },
    flagText: {
        fontSize: 24,
        marginRight: 8
    },
    countryCodeText: {
        fontSize: 16,
        color: '#000000',
        marginRight: 4,
        fontWeight: '500'
    },
    phoneTextInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#000000',
        paddingLeft: 12,
        paddingRight: 8
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%'
    },
    modalSafeArea: {
        flex: 1,
        paddingHorizontal: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    closeButton: {
        padding: 5
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginVertical: 15,
        paddingHorizontal: 15,
        height: 45
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333'
    },
    countriesList: {
        flex: 1
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#ffffff',
        minHeight: 60
    },
    countryFlag: {
        fontSize: 24,
        marginRight: 15,
        width: 30
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        color: '#333'
    },
    countryCode: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    }
});