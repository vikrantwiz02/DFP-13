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
      {/* Header */}
      <LinearGradient
        colors={[COLORS.surface.elevated, COLORS.background.primary]}
        style={styles.header}
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
            color={connected ? COLORS.success.main : COLORS.primary.main} 
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Connected Device Card */}
        {connected && deviceInfo ? (
          <View style={styles.connectedCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{deviceInfo.name}</Text>
                <Text style={styles.deviceId}>{deviceInfo.id}</Text>
              </View>
              <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectButton}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>

            {/* Connection Health */}
            <View style={styles.healthContainer}>
              <Text style={styles.healthLabel}>Connection Health</Text>
              <View style={styles.healthIndicator}>
                <Text style={styles.healthIcon}>{getHealthIcon()}</Text>
                <Text style={[styles.healthText, { color: getHealthColor() }]}>
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
                        { width: `${currentJob.progress}%` },
                      ]}
                    />
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
          </View>
        ) : (
          /* Scan for Devices */
          <View style={styles.scanSection}>
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonActive]}
              onPress={handleScan}
            >
              {scanning ? (
                <>
                  <ActivityIndicator color={COLORS.text.primary} style={styles.scanIcon} />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.scanIcon}>🔍</Text>
                  <Text style={styles.scanButtonText}>Scan for Devices</Text>
                </>
              )}
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
                    <View style={styles.deviceItemInfo}>
                      <Text style={styles.deviceItemName}>{device.name}</Text>
                      <Text style={styles.deviceItemId}>{device.id}</Text>
                    </View>
                    {device.rssi && (
                      <Text style={styles.deviceItemRssi}>{device.rssi} dBm</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Help Section */}
            <View style={styles.helpCard}>
              <Text style={styles.helpIcon}>💡</Text>
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Connection Tips</Text>
                <Text style={styles.helpText}>
                  • Make sure your device is powered on{'\n'}
                  • Keep the device within 10 meters{'\n'}
                  • Enable Bluetooth on your phone{'\n'}
                  • Restart the device if it doesn't appear
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  connectedCard: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success.main,
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
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  deviceId: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  disconnectButton: {
    backgroundColor: COLORS.error.main,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  disconnectText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: '600',
  },
  healthContainer: {
    marginBottom: SPACING.lg,
  },
  healthLabel: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  healthIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  healthText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
  },
  rssiText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  statusValue: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  printJobCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  printJobTitle: {
    fontSize: TYPOGRAPHY.sizes.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  progressPercentage: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: 'bold',
    color: COLORS.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
  },
  progressDetails: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
  },
  positionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  positionLabel: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  positionValue: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  etaText: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  scanSection: {},
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  scanButtonActive: {
    backgroundColor: COLORS.primary.dark,
  },
  scanIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  scanButtonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  devicesContainer: {
    marginBottom: SPACING.lg,
  },
  devicesTitle: {
    fontSize: TYPOGRAPHY.sizes.h4,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  deviceItemId: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
  },
  deviceItemRssi: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  helpIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});
