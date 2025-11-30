import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type ProgressScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Progress'>;

interface Props {
  navigation: ProgressScreenNavigationProp;
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

export const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const { completed: completedLessons = [] } = useSelector((state: RootState) => state.lessons);
  const { stats } = useSelector((state: RootState) => state.analytics);

  const weeklyProgress = stats.weeklyProgress || [];
  const achievements = stats.achievements || [];

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
              <Text style={styles.title}>Your Progress</Text>
              <Text style={styles.subtitle}>Track your learning journey</Text>
            </View>
            <View style={styles.trophyContainer}>
              <LinearGradient
                colors={[EDU_COLORS.warmOrange, EDU_COLORS.sunsetOrange]}
                style={styles.trophyGradient}
              >
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={[EDU_COLORS.primaryBlue + '30', EDU_COLORS.primaryBlue + '10']}
                style={styles.statCard}
              >
                <Ionicons name="book" size={32} color={EDU_COLORS.primaryBlue} />
                <Text style={styles.statValue}>{completedLessons.length}</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={[EDU_COLORS.warmOrange + '30', EDU_COLORS.warmOrange + '10']}
                style={styles.statCard}
              >
                <Ionicons name="flame" size={32} color={EDU_COLORS.warmOrange} />
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={[EDU_COLORS.vibrantGreen + '30', EDU_COLORS.vibrantGreen + '10']}
                style={styles.statCard}
              >
                <Ionicons name="time" size={32} color={EDU_COLORS.vibrantGreen} />
                <Text style={styles.statValue}>{stats.totalPracticeMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCardWrapper}>
              <LinearGradient
                colors={[EDU_COLORS.softPurple + '30', EDU_COLORS.softPurple + '10']}
                style={styles.statCard}
              >
                <Ionicons name="star" size={32} color={EDU_COLORS.softPurple} />
                <Text style={styles.statValue}>{stats.averageScore}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </LinearGradient>
            </View>
          </View>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyProgress.map((day, index) => {
                const maxMinutes = Math.max(...weeklyProgress.map((d) => d.minutes), 1);
                const height = (day.minutes / maxMinutes) * 100;
                
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBarFill,
                          { height: `${height}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{day.day}</Text>
                    <Text style={styles.chartValue}>{day.minutes}m</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Level Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress by Level</Text>
          
          {['Foundation', 'Elementary', 'Intermediate', 'Advanced', 'Specialization'].map(
            (level) => {
              const levelLessons = completedLessons.filter(
                (l) => l.level === level
              ).length;
              const totalLevelLessons = 50; // Mock total
              const percentage = (levelLessons / totalLevelLessons) * 100;

              return (
                <View key={level} style={styles.levelCard}>
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelName}>{level}</Text>
                    <Text style={styles.levelProgress}>
                      {levelLessons}/{totalLevelLessons}
                    </Text>
                  </View>
                  <View style={styles.levelProgressBar}>
                    <View
                      style={[
                        styles.levelProgressFill,
                        { width: percentage + '%' },
                      ]}
                    />
                  </View>
                </View>
              );
            }
          )}
        </View>

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {completedLessons.slice(0, 5).map((lesson, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>✓</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Completed Lesson</Text>
                <Text style={styles.activityDescription}>
                  Score: {lesson.score}% • {lesson.attempts} attempts
                </Text>
              </View>
              <Text style={styles.activityDate}>
                {new Date(lesson.completedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: EDU_COLORS.primaryBlue,
    top: -100,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: EDU_COLORS.softPurple,
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
  trophyContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  trophyGradient: {
    padding: SPACING.md,
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
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCardWrapper: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  chartBarFill: {
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  chartValue: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    color: COLORS.text.secondary,
  },
  levelCard: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  levelName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  levelProgress: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  levelProgressBar: {
    height: 6,
    backgroundColor: COLORS.surface.card,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  achievementName: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityIconText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.h4,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.text.secondary,
  },
  activityDate: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.text.secondary,
  },
});
