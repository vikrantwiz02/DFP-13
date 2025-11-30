import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import theme, { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
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
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const handleStartLesson = () => {
    dispatch(startLesson(lesson));
    navigation.navigate('ActiveLesson', { lessonId: lesson.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.levelBadge}>{lesson.level}</Text>
          {isCompleted && <Text style={styles.completedBadge}>✓ Completed</Text>}
        </View>

        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description}>{lesson.description}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>⏱ {lesson.duration_min} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={styles.metaValue}>{lesson.level}</Text>
          </View>
        </View>

        {/* Prerequisites */}
        {lesson.prerequisites && lesson.prerequisites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prerequisites</Text>
            {lesson.prerequisites.map((prereq, index) => (
              <View key={index} style={styles.prerequisiteItem}>
                <Text style={styles.prerequisiteText}>• {prereq}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Learning Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <Text style={styles.objectivesText}>
            This lesson will teach you the fundamentals of {lesson.title.toLowerCase()}.
            You'll practice recognition and writing through interactive exercises.
          </Text>
        </View>

        {/* Device Warning */}
        {!connected && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Device Not Connected</Text>
              <Text style={styles.warningText}>
                Connect your Braille device for the best learning experience
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
        >
          <Text style={styles.startButtonText}>
            {isCompleted ? 'Review Lesson' : 'Start Lesson'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary.dark,
    color: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.medium as any,
  },
  completedBadge: {
    color: theme.colors.success.main,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  metaItem: {
    flex: 1,
    backgroundColor: theme.colors.surface.elevated,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  metaLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metaValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  prerequisiteItem: {
    marginBottom: theme.spacing.sm,
  },
  prerequisiteText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  objectivesText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warning.background,
    borderWidth: 1,
    borderColor: theme.colors.warning.main,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.warning.main,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.medium,
  },
  startButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: theme.colors.surface.elevated,
  },
  startButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
  },
  errorText: {
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});