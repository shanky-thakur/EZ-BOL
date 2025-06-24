import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen({ navigation, route }) {
  // Get user data from route params or use defaults
  const userName = route?.params?.userName || 'John Doe';
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';
  const tripsCount = route?.params?.tripsCount || 24;

  const handleGetStarted = () => {
    navigation.navigate('Dashboard', { phoneNumber, userName });
  };

  const handleViewTrips = () => {
    navigation.navigate('BOLList', { phoneNumber });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with BOLy Branding */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🤖</Text>
            <Text style={styles.logoText}>BOLy</Text>
          </View>
          <Text style={styles.tagline}>Your Smart Logistics Assistant</Text>
        </View>

        {/* Main Welcome Section */}
        <View style={styles.welcomeContainer}>
          {/* User Greeting */}
          <View style={styles.greetingCard}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}! 👋</Text>
          </View>

          {/* BOLy Character & Message */}
          <View style={styles.bolyMessageContainer}>
            <View style={styles.bolyAvatar}>
              <Text style={styles.bolyAvatarIcon}>🤖</Text>
            </View>
            <View style={styles.messageCard}>
              <View style={styles.messageBubble}>
                <Text style={styles.bolyGreeting}>Hey there, {userName.split(' ')[0]}! 😊</Text>
                <Text style={styles.bolyMessage}>
                  I'm BOLy, your personal logistics companion! I'm here to help you track your shipments, 
                  manage your BOLs, and make your logistics journey smooth and effortless.
                </Text>
                <Text style={styles.bolyExcitement}>
                  Ready to dive into your logistics world? Let's make shipping simple together! ✨
                </Text>
              </View>
              <View style={styles.messageTail} />
            </View>
          </View>

          {/* Trips Counter */}
          <View style={styles.tripsContainer}>
            <View style={styles.tripsCard}>
              <View style={styles.tripsIcon}>
                <Text style={styles.tripsIconText}>🚛</Text>
              </View>
              <View style={styles.tripsInfo}>
                <Text style={styles.tripsCount}>{tripsCount}</Text>
                <Text style={styles.tripsLabel}>Total Trips Managed</Text>
              </View>
              <View style={styles.tripsDecoration}>
                <Text style={styles.tripsDecorationText}>📦</Text>
              </View>
            </View>
          </View>

          {/* User Info Card */}
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoIcon}>👤</Text>
              <Text style={styles.userInfoText}>{userName}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoIcon}>📱</Text>
              <Text style={styles.userInfoText}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Let's Get Started! 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleViewTrips}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View My Trips 📋</Text>
          </TouchableOpacity>
        </View>

        {/* Fun Facts Section */}
        <View style={styles.funFactsContainer}>
          <Text style={styles.funFactsTitle}>💡 Did You Know?</Text>
          <View style={styles.funFactCard}>
            <Text style={styles.funFactText}>
              BOLy has helped manage over 10,000+ shipments worldwide! 
              You're part of an amazing logistics community! 🌍
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#4f46e5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  welcomeContainer: {
    flex: 1,
    padding: 20,
  },
  greetingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
  },
  welcomeText: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bolyMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bolyAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#4f46e5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bolyAvatarIcon: {
    fontSize: 24,
    color: 'white',
  },
  messageCard: {
    flex: 1,
    position: 'relative',
  },
  messageBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageTail: {
    position: 'absolute',
    left: -8,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'white',
  },
  bolyGreeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  bolyMessage: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  bolyExcitement: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    lineHeight: 22,
  },
  tripsContainer: {
    marginBottom: 24,
  },
  tripsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#f59e0b',
  },
  tripsIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#fef3c7',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tripsIconText: {
    fontSize: 28,
  },
  tripsInfo: {
    flex: 1,
  },
  tripsCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  tripsLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  tripsDecoration: {
    alignItems: 'center',
  },
  tripsDecorationText: {
    fontSize: 24,
    opacity: 0.6,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfoIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  userInfoText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4f46e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#4f46e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  funFactsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  funFactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  funFactCard: {
    backgroundColor: '#fef7cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  funFactText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});