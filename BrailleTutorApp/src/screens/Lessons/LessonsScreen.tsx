import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import { fetchLessonsStart } from '../../store/slices/lessonsSlice';
import { MainTabParamList } from '../../navigation/MainTabNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';

type LessonsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Lessons'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: LessonsScreenNavigationProp;
}

export const LessonsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { available, completed, loading } = useSelector(
    (state: RootState) => state.lessons
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchLessonsStart());
    // TODO: Fetch actual lessons from API
  }, [dispatch]);

  const levels = ['Foundation', 'Elementary', 'Intermediate', 'Advanced', 'Specialization'];

  const filteredLessons = available.filter((lesson: any) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || lesson.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate('LessonDetail', { lessonId });
  };

  const isLessonCompleted = (lessonId: string) => {
    return completed.some((lesson: any) => lesson.lessonId === lessonId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>250+ lessons across 5 levels</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search lessons..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Level Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedLevel && styles.filterChipActive]}
          onPress={() => setSelectedLevel(null)}
        >
          <Text style={[styles.filterText, !selectedLevel && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.filterChip, selectedLevel === level && styles.filterChipActive]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text
              style={[styles.filterText, selectedLevel === level && styles.filterTextActive]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lessons List */}
      <ScrollView style={styles.lessonsList} contentContainerStyle={styles.lessonsContent}>
        {filteredLessons.map((lesson: any) => {
          const completed = isLessonCompleted(lesson.id);
          return (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <View style={styles.lessonHeader}>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                </View>
                {completed && <Text style={styles.completedBadge}>✓</Text>}
              </View>
              <View style={styles.lessonFooter}>
                <View style={styles.lessonMeta}>
                  <Text style={styles.levelBadge}>{lesson.level}</Text>
                  <Text style={styles.durationText}>⏱ {lesson.estimatedDuration} min</Text>
                </View>
                {!completed && lesson.isLocked && (
                  <Text style={styles.lockedText}>🔒 Locked</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.body,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: theme.spacing.md,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  filterText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.medium as any,
  },
  filterTextActive: {
    color: theme.colors.text.primary,
  },
  lessonsList: {
    flex: 1,
  },
  lessonsContent: {
    padding: theme.spacing.lg,
  },
  lessonCard: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  lessonInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  lessonTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  lessonDescription: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  completedBadge: {
    fontSize: 24,
    color: theme.colors.success.main,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary.dark,
    color: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.medium as any,
  },
  durationText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  lockedText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.warning.main,
  },
});
