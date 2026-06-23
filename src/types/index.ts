export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Health' | 'Shopping';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskRecurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reminderOffset: number; // minutes before (0, 5, 10, 15, 30, 60, -1 for none)
  recurrence: TaskRecurrence;
  completed: boolean;
  completedAt?: string | null; // ISO Date String
  createdAt: string; // ISO Date String
  notificationId?: string | null; // Expo notification identifier
}

export interface User {
  username: string;
  email: string;
  password?: string;
}

export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  alarmSoundEnabled: boolean;
  alarmVolume: number; // 0 to 1
  snoozeDuration: number; // in minutes (5, 10, 30)
  alarmVibrate: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM
}
