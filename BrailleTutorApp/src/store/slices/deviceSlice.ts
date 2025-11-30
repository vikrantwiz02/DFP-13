import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeviceInfo {
  id: string;
  name: string;
  macAddress: string;
  firmwareVersion: string;
  batteryLevel?: number;
}

interface PrintJob {
  id: string;
  name: string;
  type: 'text' | 'image' | 'lesson';
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalDots: number;
  dotsCompleted: number;
  currentPosition: { x: number; y: number };
  estimatedTimeRemaining: number;
  startTime?: number;
  lastUpdate?: number;
}

interface DeviceState {
  connected: boolean;
  connecting: boolean;
  scanning: boolean;
  deviceInfo: DeviceInfo | null;
  availableDevices: DeviceInfo[];
  currentJob: PrintJob | null;
  queue: PrintJob[];
  status: 'idle' | 'ready' | 'printing' | 'error' | 'homing';
  error: string | null;
  lastAcknowledgment: number | null;
  connectionStrength: number; // RSSI value
}

const initialState: DeviceState = {
  connected: false,
  connecting: false,
  scanning: false,
  deviceInfo: null,
  availableDevices: [],
  currentJob: null,
  queue: [],
  status: 'idle',
  error: null,
  lastAcknowledgment: null,
  connectionStrength: 0,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    startScanning(state) {
      state.scanning = true;
      state.availableDevices = [];
    },
    stopScanning(state) {
      state.scanning = false;
    },
    deviceDiscovered(state, action: PayloadAction<DeviceInfo>) {
      const exists = state.availableDevices.find(
        (d) => d.id === action.payload.id
      );
      if (!exists) {
        state.availableDevices.push(action.payload);
      }
    },
    connectStart(state) {
      state.connecting = true;
      state.error = null;
    },
    connectSuccess(state, action: PayloadAction<DeviceInfo>) {
      state.connecting = false;
      state.connected = true;
      state.deviceInfo = action.payload;
      state.status = 'ready';
    },
    connectFailure(state, action: PayloadAction<string>) {
      state.connecting = false;
      state.error = action.payload;
    },
    disconnect(state) {
      state.connected = false;
      state.deviceInfo = null;
      state.currentJob = null;
      state.queue = [];
      state.status = 'idle';
    },
    addToQueue(state, action: PayloadAction<PrintJob>) {
      state.queue.push(action.payload);
    },
    startPrintJob(state, action: PayloadAction<PrintJob>) {
      state.currentJob = action.payload;
      state.status = 'printing';
    },
    updateJobProgress(state, action: PayloadAction<{
      dotIndex: number;
      position: { x: number; y: number };
    }>) {
      if (state.currentJob) {
        state.currentJob.dotsCompleted = action.payload.dotIndex + 1;
        state.currentJob.progress =
          (state.currentJob.dotsCompleted / state.currentJob.totalDots) * 100;
        state.currentJob.currentPosition = action.payload.position;
        state.currentJob.lastUpdate = Date.now();
        state.lastAcknowledgment = Date.now();
      }
    },
    jobComplete(state, action: PayloadAction<{ jobId: string; duration: number }>) {
      if (state.currentJob && state.currentJob.id === action.payload.jobId) {
        state.currentJob.status = 'completed';
        state.currentJob.progress = 100;
        // Move to next job in queue or return to ready
        state.currentJob = null;
        state.status = state.queue.length > 0 ? 'ready' : 'idle';
      }
    },
    jobError(state, action: PayloadAction<{ jobId: string; error: string }>) {
      if (state.currentJob && state.currentJob.id === action.payload.jobId) {
        state.currentJob.status = 'failed';
        state.error = action.payload.error;
        state.status = 'error';
      }
    },
    pauseJob(state) {
      if (state.currentJob) {
        state.currentJob.status = 'paused';
        state.status = 'ready';
      }
    },
    resumeJob(state) {
      if (state.currentJob) {
        state.currentJob.status = 'printing';
        state.status = 'printing';
      }
    },
    cancelJob(state, action: PayloadAction<string>) {
      if (state.currentJob && state.currentJob.id === action.payload) {
        state.currentJob = null;
        state.status = 'ready';
      }
      state.queue = state.queue.filter((job) => job.id !== action.payload);
    },
    updateConnectionStrength(state, action: PayloadAction<number>) {
      state.connectionStrength = action.payload;
    },
    setDeviceStatus(state, action: PayloadAction<DeviceState['status']>) {
      state.status = action.payload;
    },
  },
});

export const {
  startScanning,
  stopScanning,
  deviceDiscovered,
  connectStart,
  connectSuccess,
  connectFailure,
  disconnect,
  addToQueue,
  startPrintJob,
  updateJobProgress,
  jobComplete,
  jobError,
  pauseJob,
  resumeJob,
  cancelJob,
  updateConnectionStrength,
  setDeviceStatus,
} = deviceSlice.actions;

export default deviceSlice.reducer;
