import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { allLessons } from '../../data';

interface Lesson {
  id: string;
  title: string;
  level: string;
  chapter: string;
  duration_min: number;
  description: string;
  prerequisites: string[];
  completed: boolean;
  score?: number;
  attempts?: number;
  lastAttempt?: string;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
  completedAt?: string;
}

interface LessonsState {
  available: Lesson[];
  completed: LessonProgress[];
  current: Lesson | null;
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  error: string | null;
}

const initialState: LessonsState = {
  available: allLessons,
  completed: [],
  current: null,
  currentStep: 0,
  totalSteps: 0,
  loading: false,
  error: null,
};

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    fetchLessonsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLessonsSuccess(state, action: PayloadAction<Lesson[]>) {
      state.loading = false;
      state.available = action.payload.length > 0 ? action.payload : allLessons;
    },
    fetchLessonsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      // Ensure lessons are still available even on failure
      if (state.available.length === 0) {
        state.available = allLessons;
      }
    },
    // New action to ensure lessons are loaded
    ensureLessonsLoaded(state) {
      if (state.available.length === 0) {
        state.available = allLessons;
      }
    },
    startLesson(state, action: PayloadAction<Lesson>) {
      state.current = action.payload;
      state.currentStep = 0;
      state.totalSteps = 5; // Placeholder, will be set by lesson content
    },
    nextStep(state) {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },
    previousStep(state) {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    completeLesson(state, action: PayloadAction<LessonProgress>) {
      state.completed.push(action.payload);
      if (state.current) {
        state.current.completed = true;
        state.current.score = action.payload.score;
        state.current.attempts = action.payload.attempts;
      }
      state.current = null;
      state.currentStep = 0;
    },
    exitLesson(state) {
      state.current = null;
      state.currentStep = 0;
    },
    updateLessonProgress(state, action: PayloadAction<Partial<LessonProgress>>) {
      const lessonId = state.current?.id;
      if (lessonId) {
        const existing = state.completed.find((p) => p.lessonId === lessonId);
        if (existing) {
          Object.assign(existing, action.payload);
        }
      }
    },
  },
});

export const {
  fetchLessonsStart,
  fetchLessonsSuccess,
  fetchLessonsFailure,
  ensureLessonsLoaded,
  startLesson,
  nextStep,
  previousStep,
  completeLesson,
  exitLesson,
  updateLessonProgress,
} = lessonsSlice.actions;

export default lessonsSlice.reducer;
