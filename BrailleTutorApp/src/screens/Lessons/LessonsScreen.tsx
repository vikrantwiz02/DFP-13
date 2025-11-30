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
              <Text style={styles.title}>Lessons</Text>
              <Text style={styles.subtitle}>250+ lessons across 5 levels</Text>
            </View>
            <Ionicons name="library" size={28} color={EDU_COLORS.primaryBlue} />
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
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
        {filteredLessons.map((lesson: any) => {
          const completed = isLessonCompleted(lesson.id);
          return (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <LinearGradient
                colors={[EDU_COLORS.slateGray + '40', EDU_COLORS.deepSlate + '20']}
                style={styles.lessonCardGradient}
              >
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                  </View>
                  {completed && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color={EDU_COLORS.vibrantGreen} />
                    </View>
                  )}
                </View>
                <View style={styles.lessonFooter}>
                  <View style={styles.lessonMeta}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{lesson.level}</Text>
                    </View>
                    <View style={styles.durationContainer}>
                      <Ionicons name="time-outline" size={16} color={EDU_COLORS.accent} />
                      <Text style={styles.durationText}> {lesson.duration_min} min</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.lg,
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
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    padding: SPACING.md,
    color: '#FFFFFF',
    fontSize: 16,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: EDU_COLORS.primaryBlue + '40',
    borderColor: EDU_COLORS.primaryBlue + '60',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  lessonCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lessonCardGradient: {
    padding: SPACING.lg,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  lessonInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  lessonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  completedBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  levelText: {
    color: EDU_COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  lockedText: {
    fontSize: 12,
    color: EDU_COLORS.warmOrange,
  },
});
