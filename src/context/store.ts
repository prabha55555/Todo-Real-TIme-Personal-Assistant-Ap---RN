import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User, AppSettings, TaskCategory, TaskPriority, TaskRecurrence } from '../types';
import { getNextOccurrenceDate, getLocalDateString } from '../utils/date';

interface AppState {
  // Auth & Onboarding State
  isLoggedIn: boolean;
  currentUser: User | null;
  users: User[];
  onboarded: boolean;
  
  // Tasks State
  tasks: Task[];
  activeAlarmTask: Task | null;
  
  // Settings State
  settings: AppSettings;
  
  // Filter/Sort Preferences
  searchQuery: string;
  filterType: string;
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  
  // Auth Actions
  setOnboarded: (value: boolean) => void;
  signup: (user: User) => { success: boolean; error?: string };
  login: (user: Pick<User, 'email' | 'password'>) => { success: boolean; error?: string };
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  
  // Tasks Actions
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<Task>;
  editTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  snoozeTask: (task: Task, minutes: number) => Promise<void>;
  setActiveAlarmTask: (task: Task | null) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setFilterPreferences: (prefs: { searchQuery?: string; filterType?: string; sortBy?: 'dueDate' | 'priority' | 'title' | 'createdAt' }) => void;
  
  // Backup & Reset Actions
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; error?: string };
  resetAllData: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  themeMode: 'system',
  alarmSoundEnabled: true,
  alarmVolume: 1.0,
  snoozeDuration: 5,
  alarmVibrate: true,
  dailyReminderEnabled: true,
  dailyReminderTime: '08:00',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      currentUser: null,
      users: [],
      onboarded: false,
      tasks: [],
      activeAlarmTask: null,
      settings: defaultSettings,
      searchQuery: '',
      filterType: 'All',
      sortBy: 'dueDate',

      setOnboarded: (value) => set({ onboarded: value }),

      signup: (newUser) => {
        const { users } = get();
        const exists = users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
        if (exists) {
          return { success: false, error: 'User already exists with this email' };
        }
        set({ users: [...users, newUser] });
        return { success: true };
      },

      login: ({ email, password }) => {
        const { users } = get();
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) {
          return { success: false, error: 'Invalid email or password' };
        }
        set({ isLoggedIn: true, currentUser: { username: user.username, email: user.email } });
        return { success: true };
      },

      logout: () => {
        set({ isLoggedIn: false, currentUser: null, activeAlarmTask: null });
      },

      resetPassword: (email, newPassword) => {
        const { users } = get();
        const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
        if (userIndex === -1) {
          return { success: false, error: 'User not found' };
        }
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
        set({ users: updatedUsers });
        return { success: true };
      },

      addTask: async (taskData) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
        const newTask: Task = {
          ...taskData,
          id,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        // Dynamically import notification service to avoid circular dependency
        const { scheduleTaskNotification } = await import('../services/notificationService');
        
        let notificationId = null;
        if (newTask.reminderOffset !== -1) {
          notificationId = await scheduleTaskNotification(newTask);
        }

        const taskWithNotification = { ...newTask, notificationId };
        set({ tasks: [taskWithNotification, ...get().tasks] });
        return taskWithNotification;
      },

      editTask: async (updatedTask) => {
        const { scheduleTaskNotification, cancelTaskNotification } = await import('../services/notificationService');
        
        // Cancel previous notification if any
        const existingTask = get().tasks.find((t) => t.id === updatedTask.id);
        if (existingTask?.notificationId) {
          await cancelTaskNotification(existingTask.notificationId);
        }

        // Schedule new notification if reminder is configured and task is pending
        let newNotificationId = null;
        if (!updatedTask.completed && updatedTask.reminderOffset !== -1) {
          newNotificationId = await scheduleTaskNotification(updatedTask);
        }

        const taskWithNotification = { ...updatedTask, notificationId: newNotificationId };
        
        set({
          tasks: get().tasks.map((t) => (t.id === updatedTask.id ? taskWithNotification : t)),
        });
      },

      deleteTask: async (taskId) => {
        const { cancelTaskNotification } = await import('../services/notificationService');
        const task = get().tasks.find((t) => t.id === taskId);
        
        if (task?.notificationId) {
          await cancelTaskNotification(task.notificationId);
        }

        set({
          tasks: get().tasks.filter((t) => t.id !== taskId),
          activeAlarmTask: get().activeAlarmTask?.id === taskId ? null : get().activeAlarmTask,
        });
      },

      toggleTaskCompletion: async (taskId) => {
        const { scheduleTaskNotification, cancelTaskNotification } = await import('../services/notificationService');
        
        const updatedTasks = await Promise.all(
          get().tasks.map(async (t) => {
            if (t.id === taskId) {
              const newCompleted = !t.completed;
              
              if (newCompleted) {
                // Cancel existing notification on completion
                if (t.notificationId) {
                  await cancelTaskNotification(t.notificationId);
                }
                
                // If recurring task, generate next occurrence
                if (t.recurrence !== 'None') {
                  const nextDate = getNextOccurrenceDate(t.date, t.recurrence);
                  const nextTaskData: Omit<Task, 'id' | 'completed' | 'createdAt'> = {
                    title: t.title,
                    description: t.description,
                    category: t.category,
                    priority: t.priority,
                    date: nextDate,
                    time: t.time,
                    reminderOffset: t.reminderOffset,
                    recurrence: t.recurrence,
                  };
                  
                  // Run add task asynchronously
                  setTimeout(() => {
                    get().addTask(nextTaskData);
                  }, 300);
                }

                return {
                  ...t,
                  completed: true,
                  completedAt: new Date().toISOString(),
                  notificationId: null,
                };
              } else {
                // Task marked back to pending, reschedule notification if reminder set
                let newNotificationId = null;
                if (t.reminderOffset !== -1) {
                  newNotificationId = await scheduleTaskNotification({ ...t, completed: false });
                }
                return {
                  ...t,
                  completed: false,
                  completedAt: null,
                  notificationId: newNotificationId,
                };
              }
            }
            return t;
          })
        );

        set({ tasks: updatedTasks });
      },

      snoozeTask: async (task, minutes) => {
        const { scheduleSnoozeNotification } = await import('../services/notificationService');
        const { stopAlarmSound } = await import('../services/alarmService');
        
        // Stop audio
        await stopAlarmSound();
        
        // Clear active alarm trigger state in store
        set({ activeAlarmTask: null });

        // Schedule new notification in X minutes
        await scheduleSnoozeNotification(task, minutes);
      },

      setActiveAlarmTask: (task) => set({ activeAlarmTask: task }),

      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },

      setFilterPreferences: (prefs) => {
        set({
          searchQuery: prefs.searchQuery !== undefined ? prefs.searchQuery : get().searchQuery,
          filterType: prefs.filterType !== undefined ? prefs.filterType : get().filterType,
          sortBy: prefs.sortBy !== undefined ? prefs.sortBy : get().sortBy,
        });
      },

      exportData: () => {
        const data = {
          tasks: get().tasks,
          settings: get().settings,
          onboarded: get().onboarded,
        };
        return JSON.stringify(data);
      },

      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed && Array.isArray(parsed.tasks)) {
            set({
              tasks: parsed.tasks,
              settings: parsed.settings || get().settings,
              onboarded: parsed.onboarded !== undefined ? parsed.onboarded : get().onboarded,
            });
            return { success: true };
          }
          return { success: false, error: 'Invalid data format.' };
        } catch (error: any) {
          return { success: false, error: error.message || 'JSON parsing failed' };
        }
      },

      resetAllData: async () => {
        const { cancelTaskNotification } = await import('../services/notificationService');
        const { stopAlarmSound } = await import('../services/alarmService');
        
        // Stop alarm sounds
        await stopAlarmSound();
        
        // Cancel all notifications
        const tasks = get().tasks;
        for (const task of tasks) {
          if (task.notificationId) {
            await cancelTaskNotification(task.notificationId).catch(() => {});
          }
        }

        set({
          tasks: [],
          activeAlarmTask: null,
          settings: defaultSettings,
          searchQuery: '',
          filterType: 'All',
          sortBy: 'dueDate',
        });
      },
    }),
    {
      name: 'taskflow-ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        users: state.users,
        onboarded: state.onboarded,
        tasks: state.tasks,
        settings: state.settings,
      }),
    }
  )
);
