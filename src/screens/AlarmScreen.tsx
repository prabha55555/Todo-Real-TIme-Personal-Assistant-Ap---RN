import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { Bell, Clock, Check } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { stopAlarmSound } from '../services/alarmService';

const { width } = Dimensions.get('window');

export default function AlarmScreen() {
  const activeAlarmTask = useStore((state) => state.activeAlarmTask);
  const snoozeTask = useStore((state) => state.snoozeTask);
  const setActiveAlarmTask = useStore((state) => state.setActiveAlarmTask);
  const { colors } = useAppTheme();

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Start pulsing animation when screen loads
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // infinite
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      false
    );

    return () => {
      // Clean up sound if the screen unmounts unexpectedly
      stopAlarmSound();
    };
  }, []);

  if (!activeAlarmTask) return null;

  const handleDismiss = async () => {
    await stopAlarmSound();
    setActiveAlarmTask(null);
  };

  const handleSnooze = async (minutes: number) => {
    await snoozeTask(activeAlarmTask, minutes);
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#0f172a', '#020617']} // Premium indigo-dark gradient
        style={styles.absoluteFill}
      />
      
      <View style={styles.content}>
        {/* Pulsing Alarm Icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
          <View style={styles.bellWrapper}>
            <Bell size={48} color="#f43f5e" />
          </View>
        </View>

        {/* Alarm Header */}
        <Text style={styles.alarmBadge}>REMINDER ALARM</Text>
        <Text style={styles.taskTitle}>{activeAlarmTask.title}</Text>
        
        {activeAlarmTask.description ? (
          <Text style={styles.taskDescription}>{activeAlarmTask.description}</Text>
        ) : null}

        <View style={styles.timeBadgeContainer}>
          <Clock size={16} color="#94a3b8" />
          <Text style={styles.timeText}>Scheduled for {activeAlarmTask.time}</Text>
        </View>

        {/* Snooze Options */}
        <View style={styles.snoozeSection}>
          <Text style={styles.snoozeTitle}>Snooze Alert</Text>
          <View style={styles.snoozeButtons}>
            {[5, 10, 30].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={styles.snoozeButton}
                onPress={() => handleSnooze(mins)}
              >
                <Text style={styles.snoozeButtonText}>{mins}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Check size={24} color="#ffffff" style={styles.dismissIcon} />
          <Text style={styles.dismissButtonText}>Dismiss Alarm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    width: 120,
    height: 120,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f43f5e',
  },
  bellWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  alarmBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f43f5e',
    letterSpacing: 2,
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  timeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 48,
  },
  timeText: {
    color: '#cbd5e1',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  snoozeSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  snoozeTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  snoozeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  snoozeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  snoozeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981', // Emerald green
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '80%',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  dismissIcon: {
    marginRight: 10,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
