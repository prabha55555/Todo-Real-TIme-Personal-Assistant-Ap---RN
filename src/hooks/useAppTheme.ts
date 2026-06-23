import { useColorScheme } from 'react-native';
import { useStore } from '../context/store';

export interface ThemeColors {
  background: string;
  card: string;
  cardGlass: string;
  primary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
  
  // Categories
  work: string;
  study: string;
  personal: string;
  health: string;
  shopping: string;
  
  // Priorities
  high: string;
  medium: string;
  low: string;
}

const lightTheme: ThemeColors = {
  background: '#F6F8FC',
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.85)',
  primary: '#4F46E5', // Indigo 600
  accent: '#7C3AED', // Violet 600
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  shadow: 'rgba(0, 0, 0, 0.05)',
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  danger: '#EF4444', // Red 500
  
  work: '#3B82F6', // Blue
  study: '#10B981', // Emerald
  personal: '#EC4899', // Pink
  health: '#F59E0B', // Amber
  shopping: '#8B5CF6', // Purple
  
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const darkTheme: ThemeColors = {
  background: '#0B0F19', // Slate 950 variant
  card: '#151D30',
  cardGlass: 'rgba(21, 29, 48, 0.8)',
  primary: '#6366F1', // Indigo 500
  accent: '#8B5CF6', // Violet 500
  text: '#F1F5F9', // Slate 100
  textSecondary: '#94A3B8', // Slate 400
  border: '#23304A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  success: '#34D399', // Emerald 400
  warning: '#FBBF24', // Amber 400
  danger: '#F87171', // Red 400
  
  work: '#60A5FA', // Blue 400
  study: '#34D399', // Emerald 400
  personal: '#F472B6', // Pink 400
  health: '#FBBF24', // Amber 400
  shopping: '#A78BFA', // Purple 400
  
  high: '#F87171',
  medium: '#FBBF24',
  low: '#34D399',
};

export const useAppTheme = () => {
  const themeMode = useStore((state) => state.settings.themeMode);
  const systemColorScheme = useColorScheme();
  
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
    
  const colors = isDark ? darkTheme : lightTheme;
  
  return {
    colors,
    isDark,
    themeMode,
    styles: {
      glassCard: {
        backgroundColor: colors.cardGlass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
      },
      card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
    },
  };
};
