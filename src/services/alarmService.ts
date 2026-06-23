import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

let soundInstance: Audio.Sound | null = null;
let isVibrating = false;
let vibrationInterval: any = null;

export const playAlarmSound = async (volume: number = 1.0, enableVibration: boolean = true) => {
  try {
    if (soundInstance) {
      await stopAlarmSound();
    }
    
    // Configure audio mode to play even in silent/background mode
    if (Platform.OS !== 'web') {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/alarm.wav'),
      { shouldPlay: true, isLooping: true, volume }
    );
    soundInstance = sound;
    
    if (enableVibration) {
      isVibrating = true;
      const PATTERN = [0, 500, 500, 500]; // Vibrate pattern: start immediately, vibrate 500ms, pause 500ms, vibrate 500ms
      vibrationInterval = setInterval(() => {
        Vibration.vibrate(PATTERN, false);
      }, 2000);
      Vibration.vibrate(PATTERN, false);
    }
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
};

export const stopAlarmSound = async () => {
  try {
    if (soundInstance) {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
      soundInstance = null;
    }
    if (isVibrating) {
      Vibration.cancel();
      isVibrating = false;
      if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
      }
    }
  } catch (error) {
    console.error('Failed to stop alarm sound:', error);
  }
};
