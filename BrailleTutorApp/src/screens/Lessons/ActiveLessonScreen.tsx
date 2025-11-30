import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import theme, { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { RootState } from '../../store';
import {
  nextStep,
  previousStep,
  completeLesson,
  exitLesson,
} from '../../store/slices/lessonsSlice';
import { RootStackParamList } from '../../navigation/RootNavigator';

type ActiveLessonScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ActiveLesson'
>;
type ActiveLessonScreenRouteProp = RouteProp<RootStackParamList, 'ActiveLesson'>;

interface Props {
  navigation: ActiveLessonScreenNavigationProp;
  route: ActiveLessonScreenRouteProp;
}

export const ActiveLessonScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { current: currentLesson, currentStep, totalSteps } = useSelector((state: RootState) => state.lessons);
  const [isListening, setIsListening] = useState(false);

  if (!currentLesson) {
    navigation.goBack();
    return null;
  }

  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      Alert.alert(
        'Lesson Complete!',
        'Congratulations on completing this lesson!',
        [
          {
            text: 'Review',
            onPress: () => {
              // Stay on current screen for review
            },
          },
          {
            text: 'Finish',
            onPress: () => {
              dispatch(completeLesson({ 
                lessonId: currentLesson.id, 
                completed: true,
                score: 85,
                attempts: 1,
                timeSpent: 300,
                completedAt: new Date().toISOString()
              }));
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      dispatch(previousStep());
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Lesson?',
      'Your progress will be saved. You can continue later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            dispatch(exitLesson());
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleVoiceAssistant = () => {
    setIsListening(!isListening);
    // TODO: Implement voice recognition
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepText}>
            Step {currentStep + 1} of {totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <TouchableOpacity onPress={handleVoiceAssistant} style={styles.voiceButton}>
          <Text style={styles.voiceIcon}>{isListening ? '🎤' : '🔇'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
          <Text style={styles.stepTitle}>Step {currentStep + 1}</Text>
          
          {/* Instructional Content */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {currentStep === 0
                ? 'Welcome to this lesson! Let\'s start by learning the basics.'
                : `Continue practicing. This is step ${currentStep + 1}.`}
            </Text>
          </View>

          {/* Practice Area */}
          <View style={styles.practiceArea}>
            <Text style={styles.practiceTitle}>Practice</Text>
            <View style={styles.brailleDisplay}>
              <Text style={styles.brailleText}>⠁</Text>
            </View>
            <Text style={styles.practiceHint}>
              Feel the pattern on your device and repeat it
            </Text>
          </View>

          {/* AI Tutor Section */}
          <View style={styles.tutorCard}>
            <Text style={styles.tutorIcon}>🤖</Text>
            <View style={styles.tutorContent}>
              <Text style={styles.tutorTitle}>AI Tutor</Text>
              <Text style={styles.tutorText}>
                Say "Help" to get guidance, or ask me any questions!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstStep}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Complete ✓' : 'Next →'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
  },
  exitButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  stepText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  lessonCard: {
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  lessonTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.lg,
  },
  instructionContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  practiceArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  practiceTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  brailleDisplay: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  brailleText: {
    fontSize: 64,
    color: theme.colors.primary.main,
  },
  practiceHint: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  tutorCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary.dark,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  tutorIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  tutorContent: {
    flex: 1,
  },
  tutorTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  tutorText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.medium,
    gap: theme.spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: theme.colors.surface.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  nextButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold as any,
    color: theme.colors.text.primary,
  },
});
