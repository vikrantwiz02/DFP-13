import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import {
  startScanning,
  stopScanning,
  connectStart,
  disconnect,
  updateJobProgress,
} from '../../store/slices/deviceSlice';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type DeviceScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Device'>;

interface Props {
  navigation: DeviceScreenNavigationProp;
}

const EDU_COLORS = {
  primaryBlue: '#3B82F6',
  deepBlue: '#2563EB',
  softPurple: '#8B5CF6',
  richPurple: '#7C3AED',
  vibrantGreen: '#10B981',
  emeraldGreen: '#059669',
  warmOrange: '#F59E0B',
  sunsetOrange: '#F97316',
  deepSlate: '#0F172A',
  slateGray: '#1E293B',
  cardDark: '#1A1A2E',
  accent: '#06B6D4',
};

export const DeviceScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    connected,
    deviceInfo,
    availableDevices,
    scanning,
    currentJob,
    status,
    lastAcknowledgment,
  } = useSelector((state: RootState) => state.device);

  const [connectionHealth, setConnectionHealth] = useState<'good' | 'warning' | 'error'>('good');

  useEffect(() => {
    // Monitor connection health based on last acknowledgment
    if (!connected || !lastAcknowledgment) {
      setConnectionHealth('error');
      return;
    }

    const checkHealth = setInterval(() => {
      const timeSinceAck = Date.now() - lastAcknowledgment;
      if (timeSinceAck > 10000) {
        setConnectionHealth('error');
      } else if (timeSinceAck > 5000) {
        setConnectionHealth('warning');
      } else {
        setConnectionHealth('good');
      }
    }, 1000);

    return () => clearInterval(checkHealth);
  }, [connected, lastAcknowledgment]);

  const handleScan = () => {
    if (scanning) {
      dispatch(stopScanning());
    } else {
      dispatch(startScanning());
      // TODO: Implement actual BLE scanning
    }
  };

  const handleConnect = (deviceId: string) => {
    dispatch(connectStart());
    // TODO: Implement actual BLE connection
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect Device?', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => dispatch(disconnect()),
      },
    ]);
  };

  const getHealthColor = () => {
    switch (connectionHealth) {
      case 'good':
        return COLORS.success.main;
      case 'warning':
        return COLORS.warning.main;
      case 'error':
        return COLORS.error.main;
    }
  };

  const getHealthIcon = () => {
    switch (connectionHealth) {
      case 'good':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', EDU_COLORS.deepSlate]}
        style={styles.backgroundGlow}
      >
        {/* Floating Orbs */}
        <View style={styles.floatingOrbs}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
        </View>

        {/* Header */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray, EDU_COLORS.deepSlate]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Device Manager</Text>
              <Text style={styles.subtitle}>
                {connected ? 'Device connected' : 'Pair your Braille device'}
              </Text>
            </View>
            <Ionicons 
              name={connected ? "bluetooth" : "bluetooth-outline"} 
              size={32} 
              color={connected ? EDU_COLORS.vibrantGreen : EDU_COLORS.primaryBlue} 
            />
          </View>
        </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Connected Device Card */}
        {connected && deviceInfo ? (
          <LinearGradient
            colors={[EDU_COLORS.cardDark, EDU_COLORS.deepSlate]}
            style={styles.connectedCard}
          >
            <View style={styles.deviceHeader}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{deviceInfo.name}</Text>
                <Text style={styles.deviceId}>{deviceInfo.id}</Text>
              </View>
              <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectButton}>
                <Ionicons name="close-circle" size={24} color={EDU_COLORS.warmOrange} />
              </TouchableOpacity>
            </View>

            {/* Connection Health */}
            <View style={styles.healthContainer}>
              <Text style={styles.healthLabel}>Connection Health</Text>
              <View style={styles.healthIndicator}>
                <Ionicons 
                  name={connectionHealth === 'good' ? 'radio-button-on' : connectionHealth === 'warning' ? 'warning' : 'close-circle'} 
                  size={20} 
                  color={connectionHealth === 'good' ? EDU_COLORS.vibrantGreen : connectionHealth === 'warning' ? EDU_COLORS.warmOrange : '#EF4444'} 
                />
                <Text style={[styles.healthText, { 
                  color: connectionHealth === 'good' ? EDU_COLORS.vibrantGreen : connectionHealth === 'warning' ? EDU_COLORS.warmOrange : '#EF4444' 
                }]}>
                  {connectionHealth === 'good'
                    ? 'Excellent'
                    : connectionHealth === 'warning'
                    ? 'Weak Signal'
                    : 'Disconnected'}
                </Text>
              </View>
              {deviceInfo.rssi && (
                <Text style={styles.rssiText}>Signal: {deviceInfo.rssi} dBm</Text>
              )}
            </View>

            {/* Device Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{status}</Text>
            </View>

            {/* Print Job Progress */}
            {currentJob && (
              <View style={styles.printJobCard}>
                <Text style={styles.printJobTitle}>Current Print Job</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercentage}>
                      {currentJob.progress.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: currentJob.progress + '%' },
                      ]}
                    >
                      <LinearGradient
                        colors={[EDU_COLORS.primaryBlue, EDU_COLORS.softPurple]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressGradient}
                      />
                    </View>
                  </View>
                  <Text style={styles.progressDetails}>
                    {currentJob.dotsCompleted} / {currentJob.totalDots} dots
                  </Text>
                </View>

                {currentJob.currentPosition && (
                  <View style={styles.positionContainer}>
                    <Text style={styles.positionLabel}>Current Position</Text>
                    <Text style={styles.positionValue}>
                      X: {currentJob.currentPosition.x}, Y:{' '}
                      {currentJob.currentPosition.y}
                    </Text>
                  </View>
                )}

                {currentJob.eta && (
                  <Text style={styles.etaText}>
                    ETA: {Math.ceil(currentJob.eta / 60)} minutes
                  </Text>
                )}
              </View>
            )}
          </LinearGradient>
        ) : (
          /* Scan for Devices */
          <View style={styles.scanSection}>
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonActive]}
              onPress={handleScan}
            >
              <LinearGradient
                colors={scanning ? [EDU_COLORS.deepBlue, EDU_COLORS.richPurple] : [EDU_COLORS.primaryBlue, EDU_COLORS.softPurple]}
                style={styles.scanButtonGradient}
              >
              {scanning ? (
                <>
                  <ActivityIndicator color="#FFFFFF" style={styles.scanIcon} />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search" size={24} color="#FFFFFF" style={styles.scanIcon} />
                  <Text style={styles.scanButtonText}>Scan for Devices</Text>
                </>
              )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Available Devices List */}
            {availableDevices.length > 0 && (
              <View style={styles.devicesContainer}>
                <Text style={styles.devicesTitle}>Available Devices</Text>
                {availableDevices.map((device: any) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                    onPress={() => handleConnect(device.id)}
                  >
                    <LinearGradient
                      colors={[EDU_COLORS.cardDark, EDU_COLORS.deepSlate]}
                      style={styles.deviceItemGradient}
                    >
                    <View style={styles.deviceItemInfo}>
                      <Text style={styles.deviceItemName}>{device.name}</Text>
                      <Text style={styles.deviceItemId}>{device.id}</Text>
                    </View>
                    {device.rssi && (
                      <View style={styles.rssiContainer}>
                        <Ionicons name="cellular" size={16} color={EDU_COLORS.accent} />
                        <Text style={styles.deviceItemRssi}> {device.rssi} dBm</Text>
                      </View>
                    )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Help Section */}
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
              style={styles.helpCard}
            >
              <Ionicons name="bulb" size={32} color={EDU_COLORS.warmOrange} style={styles.helpIcon} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Connection Tips</Text>
                <Text style={styles.helpText}>
                  • Make sure your device is powered on{'\n'}
                  • Keep the device within 10 meters{'\n'}
                  • Enable Bluetooth on your phone{'\n'}
                  • Restart the device if it doesn't appear
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  backgroundGlow: {
    flex: 1,
  },
  floatingOrbs: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.25,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: EDU_COLORS.primaryBlue,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: EDU_COLORS.vibrantGreen,
    bottom: -80,
    left: -80,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  connectedCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: EDU_COLORS.vibrantGreen,
    ...SHADOWS.medium,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  deviceId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  disconnectButton: {
    padding: SPACING.xs,
  },
  disconnectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  healthContainer: {
    marginBottom: SPACING.lg,
  },
  healthLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xs,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  healthIcon: {
    marginRight: SPACING.sm,
  },
  healthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rssiText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  rssiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  printJobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  printJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: EDU_COLORS.primaryBlue,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  progressDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  positionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  positionLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  etaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scanSection: {},
  scanButton: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  scanButtonActive: {
    opacity: 0.8,
  },
  scanIcon: {
    marginRight: SPACING.sm,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devicesContainer: {
    marginBottom: SPACING.lg,
  },
  devicesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  deviceItem: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  deviceItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  deviceItemId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deviceItemRssi: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  helpCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  helpIcon: {
    marginRight: SPACING.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
});
