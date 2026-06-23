import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Rect, Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import { TrendingUp, Award, Clock, PieChart as PieIcon } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { isDateToday, addDays, getLocalDateString } from '../utils/date';
import { TaskCategory } from '../types';

export default function StatisticsScreen() {
  const tasks = useStore((state) => state.tasks);
  const { colors, styles: themeStyles } = useAppTheme();

  // Basic Calculations
  const totalTasks = tasks.length;
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const completedCount = completedTasks.length;
  const pendingCount = totalTasks - completedCount;
  
  const productivityPercentage = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((completedCount / totalTasks) * 100);
  }, [totalTasks, completedCount]);

  // 1. Weekly completion statistics for the custom bar chart
  const weeklyData = useMemo(() => {
    // Determine start of current week (Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
    
    // We want the last 7 days ending today or standard Sun-Sat week. Let's do standard Mon-Sun week.
    const startOfWeek = new Date(today);
    // Adjust to Monday
    const distanceToMonday = today.getDay() === 0 ? 6 : today.getDay() - 1;
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      const checkDateStr = getLocalDateString(checkDate);

      counts[i] = completedTasks.filter((t) => t.date === checkDateStr).length;
    }

    const maxVal = Math.max(...counts, 4); // default min scale is 4 tasks

    return { labels, counts, maxVal };
  }, [completedTasks]);

  // 2. Monthly completed tasks statistics for the custom line chart
  const monthlyData = useMemo(() => {
    const today = new Date();
    const labels: string[] = [];
    const counts: number[] = [];

    // Get last 4 months ending in current month
    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
      labels.push(monthName);

      const targetMonth = monthDate.getMonth();
      const targetYear = monthDate.getFullYear();

      const count = completedTasks.filter((t) => {
        const tDate = new Date(t.date + 'T00:00:00');
        return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
      }).length;
      
      counts.push(count);
    }

    const maxVal = Math.max(...counts, 5);

    return { labels, counts, maxVal };
  }, [completedTasks]);

  // 3. Category completion data for progress gauges
  const categoryData = useMemo(() => {
    const categories: TaskCategory[] = ['Work', 'Study', 'Personal', 'Health', 'Shopping'];
    
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat);
      const catCompleted = catTasks.filter((t) => t.completed).length;
      const total = catTasks.length;
      const pct = total === 0 ? 0 : Math.round((catCompleted / total) * 100);

      return {
        name: cat,
        completed: catCompleted,
        total,
        percentage: pct,
      };
    });
  }, [tasks]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Productivity Insights</Text>
        <TrendingUp size={22} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[themeStyles.glassCard, styles.statCard]}>
            <Award size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={[themeStyles.glassCard, styles.statCard]}>
            <Clock size={20} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={[themeStyles.glassCard, styles.statCard]}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>{productivityPercentage}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Productivity</Text>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={[themeStyles.glassCard, styles.chartCard]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Completion</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
            Tasks completed per day (current week)
          </Text>

          <View style={styles.chartWrapper}>
            <Svg width="100%" height="160">
              <Defs>
                <SvgLinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.primary} />
                  <Stop offset="100%" stopColor={colors.accent} />
                </SvgLinearGradient>
              </Defs>
              
              {/* Draw bars */}
              {weeklyData.counts.map((val, idx) => {
                const chartHeight = 120;
                const barWidth = 24;
                const spacing = (100 - (7 * 8)) / 6; // distributed width percentages
                const xPos = 30 + idx * 40; // horizontal mapping offset
                const pct = val / weeklyData.maxVal;
                const barHeight = chartHeight * pct;
                const yPos = 130 - barHeight;

                return (
                  <React.Fragment key={idx}>
                    {/* Grid line */}
                    <Rect x={xPos} y={10} width={barWidth} height={chartHeight} fill={colors.border} opacity={0.1} rx={4} />
                    
                    {/* Bar */}
                    {barHeight > 0 && (
                      <Rect
                        x={xPos}
                        y={yPos}
                        width={barWidth}
                        height={barHeight}
                        fill="url(#barGrad)"
                        rx={4}
                      />
                    )}
                    {/* Count text label */}
                    <Text
                      style={{
                        position: 'absolute',
                        left: xPos + 6,
                        top: yPos - 16,
                        color: colors.text,
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {val || ''}
                    </Text>
                    {/* X-axis day Label */}
                    <Text
                      style={{
                        position: 'absolute',
                        left: xPos + 8,
                        top: 140,
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {weeklyData.labels[idx]}
                    </Text>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Monthly Line/Area Chart */}
        <View style={[themeStyles.glassCard, styles.chartCard, { marginTop: 16 }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Analysis</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
            Tasks completed over the last 4 months
          </Text>

          <View style={styles.chartWrapper}>
            <Svg width="100%" height="160">
              <Defs>
                <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>

              {/* Generate line path */}
              {(() => {
                const points = monthlyData.counts.map((val, idx) => {
                  const x = 40 + idx * 80;
                  const y = 130 - (val / monthlyData.maxVal) * 100;
                  return { x, y };
                });

                if (points.length === 0) return null;

                // Construct area path
                let areaD = `M ${points[0].x} 130 `;
                points.forEach((p) => {
                  areaD += `L ${p.x} ${p.y} `;
                });
                areaD += `L ${points[points.length - 1].x} 130 Z`;

                // Construct stroke path
                let strokeD = `M ${points[0].x} ${points[0].y} `;
                for (let i = 1; i < points.length; i++) {
                  strokeD += `L ${points[i].x} ${points[i].y} `;
                }

                return (
                  <G>
                    {/* Filled Area */}
                    <Path d={areaD} fill="url(#lineGrad)" />
                    {/* Line Stroke */}
                    <Path d={strokeD} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />
                    {/* Points */}
                    {points.map((p, idx) => (
                      <React.Fragment key={idx}>
                        <Circle cx={p.x} cy={p.y} r={5} fill={colors.card} stroke={colors.primary} strokeWidth={2.5} />
                        
                        {/* Label value */}
                        <Text
                          style={{
                            position: 'absolute',
                            left: p.x - 6,
                            top: p.y - 20,
                            color: colors.text,
                            fontSize: 10,
                            fontWeight: '700',
                          }}
                        >
                          {monthlyData.counts[idx]}
                        </Text>
                        
                        {/* Month text label */}
                        <Text
                          style={{
                            position: 'absolute',
                            left: p.x - 12,
                            top: 140,
                            color: colors.textSecondary,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {monthlyData.labels[idx]}
                        </Text>
                      </React.Fragment>
                    ))}
                  </G>
                );
              })()}
            </Svg>
          </View>
        </View>

        {/* Category Breakdown list */}
        <View style={[themeStyles.glassCard, styles.chartCard, { marginTop: 16, marginBottom: 40 }]}>
          <View style={styles.categoryTitleRow}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Category Breakdown</Text>
            <PieIcon size={16} color={colors.textSecondary} />
          </View>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
            Completion rate per category
          </Text>

          <View style={styles.categoryList}>
            {categoryData.map((cat) => {
              const categoryColors = {
                Work: colors.work,
                Study: colors.study,
                Personal: colors.personal,
                Health: colors.health,
                Shopping: colors.shopping,
              };

              return (
                <View key={cat.name} style={styles.catProgressRow}>
                  <View style={styles.catProgressHeader}>
                    <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                    <Text style={[styles.catStats, { color: colors.textSecondary }]}>
                      {cat.completed}/{cat.total} ({cat.percentage}%)
                    </Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border + '50' }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: categoryColors[cat.name],
                          width: `${cat.percentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  chartWrapper: {
    marginTop: 24,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryList: {
    marginTop: 16,
  },
  catProgressRow: {
    marginBottom: 16,
  },
  catProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
