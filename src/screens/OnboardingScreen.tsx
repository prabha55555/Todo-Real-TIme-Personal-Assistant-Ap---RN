import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, FlatList } from 'react-native';
import { Svg, Path, Circle, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const setOnboarded = useStore((state) => state.setOnboarded);
  const { colors } = useAppTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: 'Organize Tasks',
      description: 'Categorize, prioritize, and structure your daily routine using glassmorphic list components.',
      illustration: (
        <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
          {/* Decorative circles */}
          <Circle cx={100} cy={100} r={80} fill="url(#grad1)" opacity={0.15} />
          <Circle cx={40} cy={60} r={25} fill="#6366F1" opacity={0.2} />
          <Circle cx={160} cy={140} r={30} fill="#8B5CF6" opacity={0.2} />
          
          {/* Main Board */}
          <Rect x={45} y={50} width={110} height={100} rx={12} fill="rgba(255, 255, 255, 0.9)" stroke="#E2E8F0" strokeWidth={2} />
          
          {/* Task Rows */}
          <Rect x={60} y={70} width={80} height={12} rx={6} fill="#EEF2F6" />
          <Circle cx={130} cy={76} r={4} fill="#10B981" />
          
          <Rect x={60} y={94} width={80} height={12} rx={6} fill="#EEF2F6" />
          <Circle cx={130} cy={100} r={4} fill="#EF4444" />
          
          <Rect x={60} y={118} width={80} height={12} rx={6} fill="#EEF2F6" />
          <Circle cx={130} cy={124} r={4} fill="#F59E0B" />
          
          <G id="check1">
            <Circle cx={45} cy={80} r={12} fill="#6366F1" />
            <Path d="M40 80l3 3 7-7" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        </Svg>
      )
    },
    {
      id: '2',
      title: 'Never Miss Deadlines',
      description: 'Easily view and manage your timeline with our premium monthly interactive calendar interface.',
      illustration: (
        <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
          <Circle cx={100} cy={100} r={80} fill="url(#grad2)" opacity={0.15} />
          
          {/* Clock Ring */}
          <Circle cx={100} cy={100} r={55} stroke="#8B5CF6" strokeWidth={4} strokeDasharray="12 6" />
          <Circle cx={100} cy={100} r={45} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
          
          {/* Clock Hands */}
          <Path d="M100 100v-30" stroke="#0F172A" strokeWidth={3} strokeLinecap="round" />
          <Path d="M100 100l25 15" stroke="#6366F1" strokeWidth={3} strokeLinecap="round" />
          <Circle cx={100} cy={100} r={6} fill="#8B5CF6" />
          
          {/* Tiny glowing alarm alert */}
          <Circle cx={160} cy={60} r={10} fill="#EF4444" />
          <Path d="M160 57v4M160 63h.01" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      )
    },
    {
      id: '3',
      title: 'Get Smart Reminders',
      description: 'Interactive alarms and notifications that run fully offline to keep you on schedule.',
      illustration: (
        <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
          <Circle cx={100} cy={100} r={80} fill="url(#grad3)" opacity={0.15} />
          
          {/* Phone Frame */}
          <Rect x={65} y={40} width={70} height={120} rx={16} fill="#0F172A" />
          <Rect x={70} y={48} width={60} height={104} rx={12} fill="#FFFFFF" />
          
          {/* Screen Content - Bell */}
          <G transform="translate(85, 70)">
            <Path d="M15 5a8 8 0 0 0-8 8v12h16V13a8 8 0 0 0-8-8zM7 25h16M11 28a4 4 0 0 0 8 0" stroke="#6366F1" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={15} cy={16} r={2} fill="#8B5CF6" />
          </G>
          
          {/* Sound waves */}
          <Path d="M52 80a48 48 0 0 1 0-20" stroke="#EEF2F6" strokeWidth={2} strokeLinecap="round" />
          <Path d="M44 86a60 60 0 0 1 0-32" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <Path d="M148 80a48 48 0 0 0 0-20" stroke="#EEF2F6" strokeWidth={2} strokeLinecap="round" />
          <Path d="M156 86a60 60 0 0 0 0-32" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
        </Svg>
      )
    }
  ];

  const handleNext = () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentSlideIndex(nextIndex);
    } else {
      setOnboarded(true);
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
  };

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background === '#0B0F19' ? '#0F172A' : '#EFF6FF']}
      style={styles.container}
    >
      {/* Svg definitions for linear gradients used inside illustrations */}
      <Svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <Defs>
          <SvgLinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="100%" stopColor="#EC4899" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EC4899" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </SvgLinearGradient>
        </Defs>
      </Svg>

      {/* Skip Button */}
      {currentSlideIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides FlatList */}
      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.illustrationWrapper}>{item.illustration}</View>
            <View style={styles.textWrapper}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Footer controls */}
      <View style={styles.footer}>
        {/* Pagination Indicator Dots */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                {
                  backgroundColor:
                    index === currentSlideIndex ? colors.primary : colors.border,
                  width: index === currentSlideIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>
              {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  illustrationWrapper: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingBottom: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
