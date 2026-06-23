import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';
import { parseDateTime } from '../utils/date';
import { useStore } from '../context/store';
import { playAlarmSound, stopAlarmSound } from './alarmService';

// Configure default notification presentation
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted!');
    return false;
  }

  // Set up Android specific channels and categories
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-alarms', {
      name: 'Task Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default', // Can use custom sound if compiled natively, fallback to default
    });
  }

  await registerNotificationCategories();
  return true;
};

const registerNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync('task-alarm-actions', [
    {
      identifier: 'snooze-5',
      buttonTitle: 'Snooze 5 Min',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'snooze-10',
      buttonTitle: 'Snooze 10 Min',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);
};

export const scheduleTaskNotification = async (task: Task): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  try {
    const triggerTime = parseDateTime(task.date, task.time);
    
    // Subtract reminder offset in minutes
    const reminderTime = new Date(triggerTime.getTime() - task.reminderOffset * 60 * 1000);
    
    if (reminderTime.getTime() <= Date.now()) {
      // If reminder time has already passed, don't schedule
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.description || `Starts at ${task.time} (${task.category})`,
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
        categoryIdentifier: 'task-alarm-actions',
        data: { taskId: task.id },
      },
      trigger: { date: reminderTime, type: Notifications.SchedulableTriggerInputTypes.DATE },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

export const cancelTaskNotification = async (notificationId: string) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

export const scheduleSnoozeNotification = async (task: Task, minutes: number) => {
  if (Platform.OS === 'web') return;
  try {
    const triggerTime = new Date(Date.now() + minutes * 60 * 1000);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `[Snoozed] ${task.title}`,
        body: task.description || `Snoozed reminder from ${task.time}`,
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
        categoryIdentifier: 'task-alarm-actions',
        data: { taskId: task.id },
      },
      trigger: { date: triggerTime, type: Notifications.SchedulableTriggerInputTypes.DATE },
    });
  } catch (error) {
    console.error('Failed to schedule snooze notification:', error);
  }
};

// Setup background and foreground handlers
export const setupNotificationListeners = () => {
  if (Platform.OS === 'web') {
    return () => {};
  }
  // 1. Foreground listener: triggers when notification arrives while app is open
  const incomingSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
    const taskId = notification.request.content.data?.taskId;
    if (taskId) {
      const store = useStore.getState();
      const task = store.tasks.find((t) => t.id === taskId);
      
      if (task && !task.completed) {
        store.setActiveAlarmTask(task);
        if (store.settings.alarmSoundEnabled) {
          await playAlarmSound(store.settings.alarmVolume, store.settings.alarmVibrate);
        }
      }
    }
  });

  // 2. Interactive response listener: triggers when user taps notification or actions
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const taskId = response.notification.request.content.data?.taskId;
    const actionId = response.actionIdentifier;
    
    if (taskId) {
      const store = useStore.getState();
      const task = store.tasks.find((t) => t.id === taskId);
      
      if (task) {
        switch (actionId) {
          case 'snooze-5':
            await store.snoozeTask(task, 5);
            break;
          case 'snooze-10':
            await store.snoozeTask(task, 10);
            break;
          case 'dismiss':
            await stopAlarmSound();
            store.setActiveAlarmTask(null);
            break;
          default:
            // Standard tap on notification container - Open the App and trigger Alarm Overlay
            store.setActiveAlarmTask(task);
            if (store.settings.alarmSoundEnabled) {
              await playAlarmSound(store.settings.alarmVolume, store.settings.alarmVibrate);
            }
            break;
        }
      }
    }
  });

  return () => {
    incomingSubscription.remove();
    responseSubscription.remove();
  };
};
