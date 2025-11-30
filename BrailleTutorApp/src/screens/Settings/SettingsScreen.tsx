import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import { updateSetting } from '../../store/slices/settingsSlice';
import { logout } from '../../store/slices/authSlice';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type SettingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
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

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const settings = useSelector((state: RootState) => state.settings);

  const handleToggleDarkMode = (value: boolean) => {
    dispatch(updateSetting({ darkMode: value }));
  };

  const handleToggleVoiceEnabled = (value: boolean) => {
    dispatch(updateSetting({ voiceEnabled: value }));
  };

  const handleToggleHapticFeedback = (value: boolean) => {
    dispatch(updateSetting({ hapticFeedback: value }));
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleChangeLanguage = () => {
    Alert.alert('Change Language', 'Language selection coming soon!');
  };

  const handleChangeVoiceSpeed = () => {
    Alert.alert('Voice Speed', 'Voice speed adjustment coming soon!');
  };

  const handleChangeDotDepth = () => {
    Alert.alert('Dot Depth', 'Dot depth adjustment coming soon!');
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
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Customize your experience</Text>
            </View>
            <Ionicons name="settings-sharp" size={28} color={EDU_COLORS.primaryBlue} />
          </View>
        </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={[EDU_COLORS.primaryBlue, EDU_COLORS.softPurple]}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Appearance Section */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={20} color={EDU_COLORS.accent} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: EDU_COLORS.primaryBlue }}
              thumbColor="#FFFFFF"
            />
          </View>
        </LinearGradient>

        {/* Voice & Audio Section */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Voice & Audio</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mic" size={20} color={EDU_COLORS.vibrantGreen} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Voice Enabled</Text>
                <Text style={styles.settingDescription}>Enable AI voice tutor</Text>
              </View>
            </View>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={handleToggleVoiceEnabled}
              trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: EDU_COLORS.vibrantGreen }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleChangeVoiceSpeed}>
            <View style={styles.settingInfo}>
              <Ionicons name="speedometer" size={20} color={EDU_COLORS.warmOrange} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Voice Speed</Text>
                <Text style={styles.settingDescription}>
                  Current: {settings.voiceSpeed}x
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleChangeLanguage}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={20} color={EDU_COLORS.accent} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDescription}>
                  Current: {settings.language}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Device Settings */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Device Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleChangeDotDepth}>
            <View style={styles.settingInfo}>
              <Ionicons name="options" size={20} color={EDU_COLORS.primaryBlue} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Dot Depth</Text>
                <Text style={styles.settingDescription}>
                  Current: {settings.dotDepthMm}mm
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="hand-left" size={20} color={EDU_COLORS.softPurple} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibrate on interactions</Text>
              </View>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={handleToggleHapticFeedback}
              trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: EDU_COLORS.softPurple }}
              thumbColor="#FFFFFF"
            />
          </View>
        </LinearGradient>

        {/* About Section */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={20} color={EDU_COLORS.accent} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingDescription}>1.0.0</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={20} color={EDU_COLORS.vibrantGreen} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={20} color={EDU_COLORS.primaryBlue} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color={EDU_COLORS.warmOrange} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.logoutButtonGradient}
          >
            <Ionicons name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: EDU_COLORS.softPurple,
    top: -100,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: EDU_COLORS.primaryBlue,
    bottom: 100,
    left: -50,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
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
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  section: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  logoutButton: {
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
