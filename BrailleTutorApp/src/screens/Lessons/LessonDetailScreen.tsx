import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartLesson = () => {
    dispatch(startLesson(lesson));
    navigation.navigate('ActiveLesson', { lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[EDU_COLORS.slateGray, EDU_COLORS.deepSlate]}
        style={styles.backgroundGradient}
      >
        {/* Floating Orbs */}
        <View style={styles.floatingOrbs}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={[EDU_COLORS.primaryBlue, EDU_COLORS.deepBlue]}
              style={styles.levelBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.levelText}>{lesson.level.toUpperCase()}</Text>
            </LinearGradient>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={EDU_COLORS.vibrantGreen} />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>

          {/* Title Section */}
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)']}
                style={styles.statGradient}
              >
                <Ionicons name="time-outline" size={24} color={EDU_COLORS.primaryBlue} />
                <Text style={styles.statValue}>{lesson.duration_min}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.05)']}
                style={styles.statGradient}
              >
                <Ionicons name="layers-outline" size={24} color={EDU_COLORS.softPurple} />
                <Text style={styles.statValue}>{lesson.chapter}</Text>
                <Text style={styles.statLabel}>Chapter</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Prerequisites */}
          {lesson.prerequisites && lesson.prerequisites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="git-branch-outline" size={20} color={EDU_COLORS.primaryBlue} />
                <Text style={styles.sectionTitle}>Prerequisites</Text>
              </View>
              <View style={styles.prerequisitesList}>
                {lesson.prerequisites.map((prereq, index) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <View style={styles.prerequisiteCheck}>
                      <Ionicons name="checkmark" size={14} color={EDU_COLORS.vibrantGreen} />
                    </View>
                    <Text style={styles.prerequisiteText}>{prereq}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Learning Objectives */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color={EDU_COLORS.warmOrange} />
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
            </View>
            <Text style={styles.objectivesText}>
              Master the fundamentals of {lesson.title.toLowerCase()} through interactive exercises and practice.
            </Text>
          </View>

          {/* Device Connection Warning */}
          {!connected && (
            <View style={styles.warningCard}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                style={styles.warningGradient}
              >
                <View style={styles.warningHeader}>
                  <Ionicons name="warning-outline" size={24} color={EDU_COLORS.warmOrange} />
                  <Text style={styles.warningTitle}>Device Not Connected</Text>
                </View>
                <Text style={styles.warningText}>
                  Connect your Braille device for the best learning experience
                </Text>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartLesson}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[EDU_COLORS.primaryBlue, EDU_COLORS.deepBlue]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isCompleted ? 'refresh' : 'play'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>
                {isCompleted ? 'Review Lesson' : 'Start Lesson'}
              </Text>
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
    backgroundColor: EDU_COLORS.deepSlate,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.h4,
    color: COLORS.error.main,
    textAlign: 'center',
  },
  backgroundGradient: {
    flex: 1,
  },
  floatingOrbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.05,
  },
  orb1: {
    top: -50,
    right: -50,
    backgroundColor: EDU_COLORS.primaryBlue,
  },
  orb2: {
    bottom: 100,
    left: -50,
    backgroundColor: EDU_COLORS.softPurple,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  levelBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    letterSpacing: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  completedText: {
    color: EDU_COLORS.vibrantGreen,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.semiBold as any,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    lineHeight: 40,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: COLORS.text.primary,
    marginVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: TYPOGRAPHY.sizes.h4,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: COLORS.text.primary,
  },
  prerequisitesList: {
    gap: SPACING.sm,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  prerequisiteCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prerequisiteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text.primary,
  },
  objectivesText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  warningCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  warningGradient: {
    padding: SPACING.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: EDU_COLORS.warmOrange,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    minHeight: 56,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold as any,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});