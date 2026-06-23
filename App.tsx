import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppTheme } from './src/hooks/useAppTheme';
import { setupNotificationListeners, requestNotificationPermissions } from './src/services/notificationService';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function MainApp() {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    // Request notification permissions on boot
    requestNotificationPermissions();

    // Set up foreground & interactive action button listener
    const cleanup = setupNotificationListeners();
    return () => cleanup();
  }, []);

  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: colors.primary,
          secondary: colors.accent,
          background: colors.background,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: colors.primary,
          secondary: colors.accent,
          background: colors.background,
        },
      };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
