import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Location related types
export interface LocationWithTimestamp extends Location.LocationObject {
  receivedAt: string;
  backgroundTask: boolean;
}

export interface LocationData {
  locations: LocationWithTimestamp[];
}

// Debug and logging types
export interface DebugLogEntry {
  timestamp: string;
  message: string;
  data?: any;
}

export interface ErrorLogEntry {
  error: string;
  timestamp: string;
}

// File system types
export interface FileInfo {
  exists: boolean;
  size?: number;
  isDirectory?: boolean;
  modificationTime?: number;
  uri?: string;
}

// Map related types
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

// Component props types
export interface PermissionsButtonProps {
  setLocations: React.Dispatch<React.SetStateAction<LocationWithTimestamp[]>>;
  locations: LocationWithTimestamp[];
}

// Notification types
export interface NotificationData {
  type: 'location-tracking' | 'permission-request' | 'error' | 'info';
  message?: string;
  timestamp?: string;
}

export interface CustomNotificationContent {
  title: string;
  body: string;
  data?: NotificationData;
}

// Task Manager types
export interface BackgroundTaskData {
  locations: Location.LocationObject[];
}

export interface BackgroundTaskError {
  message: string;
  code?: string;
}

export interface TaskManagerData {
  data?: BackgroundTaskData;
  error?: BackgroundTaskError;
}

// Permission types
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

// Location tracking configuration
export interface LocationTrackingConfig {
  accuracy: Location.LocationAccuracy;
  timeInterval: number;
  deferredUpdatesInterval: number;
  activityType: Location.LocationActivityType;
  showsBackgroundLocationIndicator: boolean;
  foregroundService?: {
    notificationTitle: string;
    notificationBody: string;
  };
}

// App state types
export interface AppState {
  locations: LocationWithTimestamp[];
  isTracking: boolean;
  hasPermissions: boolean;
  debugInfo: string;
}

// Style types (for better type safety with StyleSheet)
export interface AppStyles {
  container: object;
  text: object;
  button: object;
  debugButton: object;
  debugButtonsContainer: object;
  debugContainer: object;
  debugText: object;
  buttonText: object;
  scrollContainer: object;
  locationText: object;
  map: object;
}

// Utility types
export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

export type LocationSetter = SetStateFunction<LocationWithTimestamp[]>;

// Constants
export const FILE_PATHS = {
  LOCATIONS: 'background_locations.json',
  DEBUG_LOG: 'debug_logs.json',
  ERROR_LOG: 'error_logs.json',
} as const;

export const TASK_NAMES = {
  BACKGROUND_LOCATION: 'background-location-task',
  DO_NOTHING: 'DO_NOTHING_TASK',
} as const;

// Type guards
export const isLocationWithTimestamp = (location: any): location is LocationWithTimestamp => {
  return location && 
         typeof location.receivedAt === 'string' && 
         typeof location.backgroundTask === 'boolean' &&
         location.coords &&
         typeof location.coords.latitude === 'number' &&
         typeof location.coords.longitude === 'number';
};

export const isValidMapCoordinate = (coord: any): coord is MapCoordinate => {
  return coord && 
         typeof coord.latitude === 'number' && 
         typeof coord.longitude === 'number' &&
         coord.latitude >= -90 && coord.latitude <= 90 &&
         coord.longitude >= -180 && coord.longitude <= 180;
};

// Async function types
export type AsyncLocationFunction = () => Promise<Location.LocationObject | null>;
export type AsyncPermissionFunction = () => Promise<PermissionResult>;
export type AsyncNotificationFunction = () => Promise<void>;
export type AsyncFileOperation<T> = () => Promise<T>;

// Error types
export interface LocationError extends Error {
  code?: string;
  type: 'permission' | 'network' | 'timeout' | 'unknown';
}

export interface FileSystemError extends Error {
  code?: string;
  type: 'read' | 'write' | 'delete' | 'access';
}

// React Native Paper component prop types (if needed for custom styling)
export interface ButtonProps {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

// Expo constants types
export interface ExpoConfig {
  extra?: {
    eas?: {
      projectId?: string;
    };
  };
}

// Background task result types
export type BackgroundTaskResult = 'success' | 'error' | 'no-data';

export interface BackgroundTaskResponse {
  result: BackgroundTaskResult;
  message?: string;
  data?: any;
}
