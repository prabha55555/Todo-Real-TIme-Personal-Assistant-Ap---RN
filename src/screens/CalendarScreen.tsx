import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Edit2, Trash2 } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { getLocalDateString, formatDisplayDate, formatDisplayTime } from '../utils/date';
import { Task, TaskCategory, TaskPriority } from '../types';

export default function CalendarScreen({ navigation }: any) {
  const tasks = useStore((state) => state.tasks);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);
  const deleteTask = useStore((state) => state.deleteTask);
  
  const { colors, styles: themeStyles } = useAppTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getLocalDateString());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days of week header
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Custom Calendar Math Grid
  const calendarGrid = useMemo(() => {
    // First day of current month (day of week: 0 to 6)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    // Days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Days in previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      cells.push({
        dateStr: `${prevYear}-${mStr}-${dStr}`,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // Current month cells
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      cells.push({
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // Next month padding cells to complete a 6-row grid (42 cells)
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      cells.push({
        dateStr: `${nextYear}-${mStr}-${dStr}`,
        dayNum: day,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks, selectedDateStr]);

  // Task map to render indicators in calendar days
  const taskIndicatorsMap = useMemo(() => {
    const map: Record<string, { count: number; highestPriority: TaskPriority }> = {};
    
    tasks.forEach((t) => {
      if (t.completed) return; // ignore completed for indicators
      
      const dateStr = t.date;
      if (!map[dateStr]) {
        map[dateStr] = { count: 0, highestPriority: 'Low' };
      }
      
      map[dateStr].count += 1;
      
      // Determine highest priority for visual indicator dot
      if (t.priority === 'High') {
        map[dateStr].highestPriority = 'High';
      } else if (t.priority === 'Medium' && map[dateStr].highestPriority !== 'High') {
        map[dateStr].highestPriority = 'Medium';
      }
    });
    
    return map;
  }, [tasks]);

  const changeMonth = (direction: 'prev' | 'next') => {
    const offset = direction === 'prev' ? -1 : 1;
    const nextDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentDate(nextDate);
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule Calendar</Text>
        <CalendarIcon size={20} color={colors.textSecondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Calendar Body Card */}
        <View style={[themeStyles.glassCard, styles.calendarCard]}>
          {/* Month Navigator Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border }]} onPress={() => changeMonth('prev')}>
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthNameText, { color: colors.text }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border }]} onPress={() => changeMonth('next')}>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Days of Week Row */}
          <View style={styles.daysOfWeekRow}>
            {daysOfWeek.map((day, idx) => (
              <Text key={idx} style={[styles.dayOfWeekText, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((cell, idx) => {
              const hasTasks = !!taskIndicatorsMap[cell.dateStr];
              const highestPriority = taskIndicatorsMap[cell.dateStr]?.highestPriority;
              const isSelected = selectedDateStr === cell.dateStr;
              
              let indicatorColor = colors.low;
              if (highestPriority === 'High') indicatorColor = colors.high;
              if (highestPriority === 'Medium') indicatorColor = colors.medium;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.gridCell,
                    isSelected && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedDateStr(cell.dateStr)}
                >
                  <Text
                    style={[
                      styles.cellDayText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : cell.isCurrentMonth
                          ? colors.text
                          : colors.textSecondary + '60',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {cell.dayNum}
                  </Text>
                  
                  {/* Task indicator dot */}
                  {hasTasks && (
                    <View
                      style={[
                        styles.indicatorDot,
                        {
                          backgroundColor: isSelected ? '#FFFFFF' : indicatorColor,
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Focused Date Header */}
        <View style={styles.selectedDateSection}>
          <Text style={[styles.selectedDateTitle, { color: colors.text }]}>
            {formatDisplayDate(selectedDateStr)}
          </Text>
          <Text style={[styles.selectedDateSubtitle, { color: colors.textSecondary }]}>
            {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled
          </Text>
        </View>

        {/* Selected Date Task List */}
        <View style={styles.taskListContainer}>
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((item) => {
              const categoryColors = {
                Work: colors.work,
                Study: colors.study,
                Personal: colors.personal,
                Health: colors.health,
                Shopping: colors.shopping,
              };
              const priorityColors = {
                High: colors.high,
                Medium: colors.medium,
                Low: colors.low,
              };

              return (
                <View
                  key={item.id}
                  style={[
                    themeStyles.glassCard,
                    styles.taskCard,
                    item.completed && styles.taskCardCompleted,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      {
                        borderColor: item.completed ? colors.success : colors.border,
                        backgroundColor: item.completed ? colors.success : 'transparent',
                      },
                    ]}
                    onPress={() => toggleTaskCompletion(item.id)}
                  >
                    {item.completed && <Check size={14} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color: colors.text,
                          textDecorationLine: item.completed ? 'line-through' : 'none',
                          opacity: item.completed ? 0.6 : 1,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>

                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.metaBadge,
                          { backgroundColor: categoryColors[item.category] + '20' },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: categoryColors[item.category] }]}>
                          {item.category}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.metaBadge,
                          { backgroundColor: priorityColors[item.priority] + '20' },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: priorityColors[item.priority], fontWeight: '700' }]}>
                          {item.priority}
                        </Text>
                      </View>
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                        {formatDisplayTime(item.time)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      onPress={() => navigation.navigate('CreateTask', { task: item })}
                    >
                      <Edit2 size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionIconButton, { marginTop: 8 }]}
                      onPress={() => handleDeleteTask(item.id, item.title)}
                    >
                      <Trash2 size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyTasksWrapper}>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontStyle: 'italic' }}>
                No tasks scheduled for this day.
              </Text>
            </View>
          )}
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
    paddingBottom: 40,
  },
  calendarCard: {
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    borderWidth: 1,
    borderRadius: 10,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: `${100 / 7}%`,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  cellDayText: {
    fontSize: 14,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    position: 'absolute',
    bottom: 6,
  },
  selectedDateSection: {
    marginTop: 24,
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectedDateSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  taskListContainer: {
    marginTop: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
  },
  actionIconButton: {
    padding: 4,
  },
  emptyTasksWrapper: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
