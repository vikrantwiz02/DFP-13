import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import { startLesson } from '../../store/slices/lessonsSlice';
import { RootStackParamList } from '../../navigation/RootNavigator';

type LessonDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LessonDetail'
>;
type LessonDetailScreenRouteProp = RouteProp<RootStackParamList, 'LessonDetail'>;

interface Props {
  navigation: LessonDetailScreenNavigationProp;
  route: LessonDetailScreenRouteProp;
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

export const LessonDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId } = route.params;
  const dispatch = useDispatch();
  const { available, completed } = useSelector(
    (state: RootState) => state.lessons
  );
  const { connected } = useSelector((state: RootState) => state.device);

  const lesson = available.find((l) => l.id === lessonId);
  const isCompleted = completed.some((l) => l.lessonId === lessonId);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[EDU_COLORS.slateGray, EDU_COLORS.deepSlate]}
          style={styles.backgroundGradient}
        >
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.error.main} />
            <Text style={styles.errorText}>Lesson not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const handleStartLesson = () => {
    dispatch(startLesson(lesson));
    navigation.navigate('ActiveLesson', { lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[EDU_COLORS.deepSlate, '#0A0A0F']}
        style={styles.backgroundGradient}
      >
        {/* Header Card - Matching LessonsScreen Style */}
        <LinearGradient
          colors={[EDU_COLORS.slateGray, EDU_COLORS.deepSlate]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* Level Badge */}
              <View style={styles.levelBadgeContainer}>
                <Text style={styles.levelText}>{lesson.level.toUpperCase()}</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{lesson.title}</Text>

              {/* Description */}
              <Text style={styles.subtitle}>{lesson.description}</Text>

              {/* Chapter Info */}
              <View style={styles.chapterInfo}>
                <Ionicons name="layers-outline" size={16} color={EDU_COLORS.accent} />
                <Text style={styles.chapterText}>{lesson.chapter}</Text>
              </View>
            </View>

            {/* Stats Circle */}
            <View style={styles.headerRight}>
              <View style={styles.statsCircle}>
                <Ionicons name="time-outline" size={24} color={EDU_COLORS.primaryBlue} />
                <Text style={styles.statsValue}>{lesson.duration_min}</Text>
                <Text style={styles.statsLabel}>min</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* What You'll Learn Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color={EDU_COLORS.warmOrange} />
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
            </View>
            <View style={styles.learningCard}>
              <Text style={styles.learningText}>
                Master the fundamentals of {lesson.title.toLowerCase()} through interactive exercises and practice.
              </Text>
            </View>
          </View>

          {/* Device Connection Warning */}
          {!connected && (
            <View style={styles.warningCard}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={24} color={EDU_COLORS.warmOrange} />
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Device Not Connected</Text>
                <Text style={styles.warningText}>
                  Connect your Braille device for the best learning experience
                </Text>
              </View>
            </View>
          )}

          {/* Bottom padding for button */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartLesson}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[EDU_COLORS.primaryBlue, EDU_COLORS.deepBlue]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="play"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>Start Lesson</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.h3,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: EDU_COLORS.primaryBlue,
    borderRadius: RADIUS.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semiBold as any,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerRight: {
    marginLeft: SPACING.sm,
  },
  statsCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 3,
    borderColor: EDU_COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: '#FFFFFF',
    marginTop: 2,
  },
  statsLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 6,
  },
  chapterText: {
    fontSize: 13,
    color: EDU_COLORS.accent,
  },
  headerBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  levelBadgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
    marginLeft: 48,
    backgroundColor: EDU_COLORS.primaryBlue + '40',
    borderWidth: 1,
    borderColor: EDU_COLORS.primaryBlue + '60',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: '#FFFFFF',
  },
  learningCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  learningText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: EDU_COLORS.warmOrange,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(10, 10, 15, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    minHeight: 52,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});