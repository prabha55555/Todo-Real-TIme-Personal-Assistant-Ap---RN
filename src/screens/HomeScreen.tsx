import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Path } from 'react-native-svg';
import { Search, Plus, Calendar, Clock, Filter, SlidersHorizontal, Check, Trash2, Edit2, AlertCircle } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { isDateToday, isDateTomorrow, isDateThisWeek, formatDisplayDate, formatDisplayTime, getLocalDateString } from '../utils/date';
import { Task, TaskCategory, TaskPriority } from '../types';

export default function HomeScreen({ navigation }: any) {
  const currentUser = useStore((state) => state.currentUser);
  const tasks = useStore((state) => state.tasks);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);
  const deleteTask = useStore((state) => state.deleteTask);
  
  const { colors, styles: themeStyles } = useAppTheme();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFilter, setSelectedFilter] = useState<string>('Today');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Statistics calculation
  const todayTasks = useMemo(() => {
    const todayStr = getLocalDateString();
    return tasks.filter(t => t.date === todayStr);
  }, [tasks]);

  const todayCompletedCount = useMemo(() => {
    return todayTasks.filter(t => t.completed).length;
  }, [todayTasks]);

  const todayPendingCount = useMemo(() => {
    return todayTasks.filter(t => !t.completed).length;
  }, [todayTasks]);

  const todayCompletionPercentage = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((todayCompletedCount / todayTasks.length) * 100);
  }, [todayTasks, todayCompletedCount]);

  // Categories list
  const categories = ['All', 'Work', 'Study', 'Personal', 'Health', 'Shopping'];

  // Filters list
  const filters = [
    { label: 'Today', value: 'Today' },
    { label: 'Tomorrow', value: 'Tomorrow' },
    { label: 'This Week', value: 'ThisWeek' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' },
    { label: 'High Priority', value: 'HighPriority' },
    { label: 'All Tasks', value: 'All' },
  ];

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;

        // Date/Status filters
        let matchesFilter = true;
        if (selectedFilter === 'Today') {
          matchesFilter = isDateToday(task.date);
        } else if (selectedFilter === 'Tomorrow') {
          matchesFilter = isDateTomorrow(task.date);
        } else if (selectedFilter === 'ThisWeek') {
          matchesFilter = isDateThisWeek(task.date);
        } else if (selectedFilter === 'Pending') {
          matchesFilter = !task.completed;
        } else if (selectedFilter === 'Completed') {
          matchesFilter = task.completed;
        } else if (selectedFilter === 'HighPriority') {
          matchesFilter = task.priority === 'High' && !task.completed;
        }

        return matchesSearch && matchesCategory && matchesFilter;
      })
      .sort((a, b) => {
        // Sort priority helper mapping
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };

        if (sortBy === 'priority') {
          const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
          if (weightDiff !== 0) return weightDiff;
          return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        }

        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }

        // Default 'dueDate' sort
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  }, [tasks, searchQuery, selectedCategory, selectedFilter, sortBy]);

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

  // SVG Circular progress details
  const radius = 32;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayCompletionPercentage / 100) * circumference;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {currentUser?.username || 'User'} 👋
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      {/* Today Progress Card */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressCard}
      >
        <View style={styles.progressTextSection}>
          <Text style={styles.progressCardTitle}>Today's Progress</Text>
          <Text style={styles.progressCardSubtitle}>
            {todayTasks.length === 0
              ? 'No tasks scheduled for today'
              : `${todayCompletedCount} of ${todayTasks.length} tasks completed`}
          </Text>
          <Text style={styles.progressCardQuote}>
            {todayCompletionPercentage === 100 && todayTasks.length > 0
              ? "Incredible! You've cleared the day! 🚀"
              : todayCompletionPercentage >= 50
              ? 'Over halfway there! Keep it going! 💪'
              : todayTasks.length > 0
              ? 'Start with high-priority tasks first! ⚡'
              : 'Add tasks using the button below.'}
          </Text>
        </View>
        <View style={styles.circularProgressWrapper}>
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Circle
              cx={40}
              cy={40}
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={40}
              cy={40}
              r={radius}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform="rotate(-90 40 40)"
            />
          </Svg>
          <Text style={styles.percentageText}>{todayCompletionPercentage}%</Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search your tasks..."
          placeholderTextColor={colors.textSecondary + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category horizontal scroller */}
      <View style={styles.scrollSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: selectedCategory === cat ? colors.primary + '15' : colors.card,
                  borderColor: selectedCategory === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  {
                    color: selectedCategory === cat ? colors.primary : colors.text,
                    fontWeight: selectedCategory === cat ? '700' : '500',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter and Sort section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedFilter === f.value ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setSelectedFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: selectedFilter === f.value ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: selectedFilter === f.value ? '700' : '500',
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Controls toggle */}
        <TouchableOpacity
          style={[styles.sortToggleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <SlidersHorizontal size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sort options submenu dropdown */}
      {showSortOptions && (
        <View style={[styles.sortDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sortDropdownTitle, { color: colors.textSecondary }]}>SORT BY</Text>
          <View style={styles.sortOptionsRow}>
            {([
              { label: 'Due Date', value: 'dueDate' },
              { label: 'Priority', value: 'priority' },
              { label: 'Alphabetical', value: 'title' },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sortOptionBtn,
                  {
                    backgroundColor: sortBy === opt.value ? colors.primary + '15' : 'transparent',
                    borderColor: sortBy === opt.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSortBy(opt.value);
                  setShowSortOptions(false);
                }}
              >
                <Text style={{ color: sortBy === opt.value ? colors.primary : colors.text, fontSize: 13, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const categoryColors: Record<TaskCategory, string> = {
            Work: colors.work,
            Study: colors.study,
            Personal: colors.personal,
            Health: colors.health,
            Shopping: colors.shopping,
          };
          const priorityColors: Record<TaskPriority, string> = {
            High: colors.high,
            Medium: colors.medium,
            Low: colors.low,
          };

          return (
            <View style={[themeStyles.glassCard, styles.taskCard, item.completed && styles.taskCardCompleted]}>
              {/* Left Action: Completion Checkbox */}
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

              {/* Task Details */}
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
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.description ? (
                  <Text
                    style={[
                      styles.taskDesc,
                      { color: colors.textSecondary, opacity: item.completed ? 0.5 : 0.8 },
                    ]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                ) : null}

                {/* Badges / Meta */}
                <View style={styles.metaRow}>
                  <View style={[styles.metaBadge, { backgroundColor: categoryColors[item.category] + '20' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: categoryColors[item.category] }]} />
                    <Text style={[styles.badgeText, { color: categoryColors[item.category] }]}>
                      {item.category}
                    </Text>
                  </View>
                  <View style={[styles.metaBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
                    <Text style={[styles.badgeText, { color: priorityColors[item.priority], fontWeight: '700' }]}>
                      {item.priority}
                    </Text>
                  </View>

                  <View style={styles.metaTime}>
                    <Calendar size={12} color={colors.textSecondary} />
                    <Text style={[styles.metaTimeText, { color: colors.textSecondary }]}>
                      {formatDisplayDate(item.date)}
                    </Text>
                  </View>
                  <View style={styles.metaTime}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={[styles.metaTimeText, { color: colors.textSecondary }]}>
                      {formatDisplayTime(item.time)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Action buttons */}
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={() => navigation.navigate('CreateTask', { task: item })}
                >
                  <Edit2 size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionIconButton, { marginTop: 12 }]}
                  onPress={() => handleDeleteTask(item.id, item.title)}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
              <Circle cx={60} cy={60} r={50} fill={colors.border} opacity={0.3} />
              <Path
                d="M45 60l10 10 20-20"
                stroke={colors.textSecondary}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />
            </Svg>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No tasks found</Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              There are no tasks matching your current filters. Add a new task to get started!
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabWrapper}
        onPress={() => navigation.navigate('CreateTask')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Plus size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
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
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  progressTextSection: {
    flex: 1,
    paddingRight: 16,
  },
  progressCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  progressCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  progressCardQuote: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 12,
  },
  circularProgressWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
  },
  percentageText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  scrollSection: {
    marginTop: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  categoryTabText: {
    fontSize: 14,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  filterScroll: {
    paddingRight: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  filterTabText: {
    fontSize: 13,
  },
  sortToggleBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortDropdown: {
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  sortDropdownTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortOptionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100, // Safe space for FAB
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metaTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  metaTimeText: {
    fontSize: 11,
    marginLeft: 3,
    fontWeight: '500',
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  actionIconButton: {
    padding: 6,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
