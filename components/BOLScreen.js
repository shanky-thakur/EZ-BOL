import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';

export default function BOLListScreen({ navigation, route }) {
  // Get phone number from previous screen or use default
  const phoneNumber = route?.params?.phoneNumber || '+919625348422';

  const [bols, setBols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Map API response to component expected format
  const mapBolData = (rawBols) => {
    // Check if rawBols is an array directly, not nested in a 'bols' property
    const bolArray = Array.isArray(rawBols) ? rawBols : (rawBols.bols || []);
    
    return bolArray.map(bol => ({
      _id: bol.row_number || bol._id,
      row_number: bol.row_number,
      shipper: bol.Shipper || bol['Shipper Name'] || 'Unknown Shipper',
      proBarcode: bol['PRO Barcode'] || bol.proBarcode || 'N/A',
      shipperCity: bol['Shipper City'] || bol.shipperCity || 'Unknown',
      consigneeCity: bol['Consignee City'] || bol.consigneeCity || 'Unknown',
      Dtae: bol.Date || bol.Dtae || 'N/A', // Note: keeping original typo for compatibility
      weight: bol.Weight || bol.weight || 'N/A',
      packageName: bol['Kind of Packaging'] || bol.packageName || 'Package',
      status: bol.status || 'pending', // Default status if not provided
      // Additional fields that might be useful
      shipperName: bol['Shipper Name'] || bol.shipperName,
      consigneeName: bol['Consignee Name'] || bol.consigneeName,
      amount: bol.Amount || bol.amount,
      hazmat: bol.Hazmat || bol.hazmat,
      units: bol.Units || bol.units,
      nmfcCode: bol['NMFC Code'] || bol.nmfcCode,
      customerRefNumber: bol['Customer Reference Number'] || bol.customerRefNumber,
      // Store original data for reference
      originalData: bol
    }));
  };

  // Fetch BOLs function
  const fetchBols = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('https://semsy-boy.app.n8n.cloud/webhook-test/today_shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Raw API Response:', data);
      
      // Handle the response - it might be an array directly or have a nested structure
      let mappedBols = [];
      if (Array.isArray(data)) {
        // If data is directly an array
        mappedBols = mapBolData(data);
      } else if (data && data.bols && Array.isArray(data.bols)) {
        // If data has a 'bols' property that's an array
        mappedBols = mapBolData(data.bols);
      } else if (data && typeof data === 'object') {
        // If data is an object, try to find array values
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          mappedBols = mapBolData(possibleArrays[0]);
        }
      }
      
      console.log('Mapped BOL data:', mappedBols);
      setBols(mappedBols);
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch BOLs';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBols();
  }, [phoneNumber]);

  // Handle refresh
  const onRefresh = () => {
    fetchBols(true);
  };

  // Handle back button press
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back, navigate to a default screen
      navigation.navigate('Login'); 
    }
  };

  // Handle BOL selection
  const handleBolSelect = (bol) => {
    // Navigate to chat interface with selected BOL
    navigation.navigate('Home', { 
      phoneNumber: phoneNumber,
      selectedBol: bol,
      bolId: bol._id,
      row_number: bol.row_number
    });
  };

  // Handle chat button press
  const handleChatPress = (bol) => {
    // Prevent event bubbling
    navigation.navigate('Home', { 
      phoneNumber: phoneNumber,
      selectedBol: bol,
      bolId: bol._id,
      row_number: bol.row_number
    });
  };

  // Render individual BOL item
  const renderBolItem = (bol, index) => (
    <TouchableOpacity
      key={bol.row_number || bol._id || index}
      style={styles.bolCard}
      onPress={() => handleBolSelect(bol)}
      activeOpacity={0.7}
    >
      <View style={styles.bolHeader}>
        <View style={styles.bolIconContainer}>
          <Text style={styles.bolIcon}>📦</Text>
        </View>
        <View style={styles.bolMainInfo}>
          <Text style={styles.bolTitle}>{bol.shipper}</Text>
          <Text style={styles.bolBarcode}>BOL: {bol.proBarcode}</Text>
        </View>
        <View style={styles.bolStatusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(bol.status) }]} />
        </View>
      </View>

      <View style={styles.bolDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>From: {bol.shipperCity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🎯</Text>
          <Text style={styles.detailText}>To: {bol.consigneeCity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>Date: {bol.Dtae}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>⚖️</Text>
          <Text style={styles.detailText}>Weight: {bol.weight} {bol.units || ''}</Text>
        </View>
        {bol.amount && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>Amount: ${bol.amount}</Text>
          </View>
        )}
        {bol.hazmat && bol.hazmat.toLowerCase() === 'yes' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⚠️</Text>
            <Text style={styles.detailText}>Hazmat: Yes</Text>
          </View>
        )}
      </View>

      <View style={styles.bolFooter}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageName}>{bol.packageName}</Text>
          {bol.customerRefNumber && (
            <Text style={styles.refNumber}>Ref: {bol.customerRefNumber}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent parent onPress
            handleChatPress(bol);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.chatButtonText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Get status color based on BOL status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'in-transit': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My BOLs</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading BOLs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My BOLs</Text>
      </View>

      {/* Phone Number Display */}
      <View style={styles.phoneContainer}>
        <Text style={styles.phoneText}>📱 {phoneNumber}</Text>
      </View>

      {/* BOL Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {bols.length} BOL{bols.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* BOL List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={() => fetchBols()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {bols.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No BOLs Found</Text>
            <Text style={styles.emptyText}>
              No BOLs are associated with {phoneNumber}
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshEmptyButton}>
              <Text style={styles.refreshEmptyButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bols.map((bol, index) => renderBolItem(bol, index))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    paddingTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  headerRight: {
    width: 40, // For symmetry with back button
  },
  phoneContainer: {
    backgroundColor: 'white',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  bolCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  bolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bolIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#e0e7ff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#c7d2fe',
  },
  bolIcon: {
    fontSize: 24,
  },
  bolMainInfo: {
    flex: 1,
  },
  bolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  bolBarcode: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'monospace',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bolStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  bolDetails: {
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    fontWeight: '500',
  },
  bolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  refNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  refreshEmptyButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshEmptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});