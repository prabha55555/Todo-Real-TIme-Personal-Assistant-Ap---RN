import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';

// Import Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import AlarmScreen from '../screens/AlarmScreen';

// Types for navigation
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  CreateTask: { task?: any } | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CalendarTab: undefined;
  StatisticsTab: undefined;
  ProfileTab: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 1. Auth Stack Navigator
function AuthNavigator() {
  const { colors } = useAppTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// 2. Main Tabs Navigator
function MainTabNavigator() {
  const { colors } = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary + '70',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = 20;
          switch (route.name) {
            case 'HomeTab':
              return <Home size={iconSize} color={color} />;
            case 'CalendarTab':
              return <Calendar size={iconSize} color={color} />;
            case 'StatisticsTab':
              return <BarChart3 size={iconSize} color={color} />;
            case 'ProfileTab':
              return <Settings size={iconSize} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="StatisticsTab"
        component={StatisticsScreen}
        options={{ tabBarLabel: 'Insights' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// 3. Root Application Navigator
export default function AppNavigator() {
  const onboarded = useStore((state) => state.onboarded);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const activeAlarmTask = useStore((state) => state.activeAlarmTask);
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {!onboarded ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isLoggedIn ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen
              name="CreateTask"
              component={CreateTaskScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </RootStack.Navigator>

      {/* Global alarm screen overlay if alarm triggers */}
      {activeAlarmTask && <AlarmScreen />}
    </View>
  );
}
