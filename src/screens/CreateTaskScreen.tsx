import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Bell, RefreshCw, AlertCircle, FileText } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { getLocalDateString, formatDisplayDate, formatDisplayTime } from '../utils/date';
import { TaskCategory, TaskPriority, TaskRecurrence } from '../types';

export default function CreateTaskScreen({ navigation, route }: any) {
  const editTaskData = route.params?.task;
  const isEditing = !!editTaskData;

  const addTask = useStore((state) => state.addTask);
  const editTask = useStore((state) => state.editTask);
  const { colors, styles: themeStyles } = useAppTheme();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: editTaskData?.title || '',
      description: editTaskData?.description || '',
      category: (editTaskData?.category as TaskCategory) || 'Work',
      priority: (editTaskData?.priority as TaskPriority) || 'Medium',
      reminderOffset: editTaskData?.reminderOffset !== undefined ? editTaskData.reminderOffset : 15, // Default 15 mins before
      recurrence: (editTaskData?.recurrence as TaskRecurrence) || 'None',
    }
  });

  // Sync date and time if editing
  useEffect(() => {
    if (isEditing && editTaskData) {
      const taskDate = new Date(editTaskData.date + 'T00:00:00');
      const [hours, minutes] = editTaskData.time.split(':');
      const taskTime = new Date();
      taskTime.setHours(parseInt(hours, 10));
      taskTime.setMinutes(parseInt(minutes, 10));
      
      setDate(taskDate);
      setTime(taskTime);
    }
  }, [isEditing, editTaskData]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const onSubmit = async (data: any) => {
    // Format local date string (YYYY-MM-DD)
    const formattedDate = getLocalDateString(date);
    
    // Format local time string (HH:MM)
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    if (isEditing && editTaskData) {
      await editTask({
        ...editTaskData,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        date: formattedDate,
        time: formattedTime,
        reminderOffset: data.reminderOffset,
        recurrence: data.recurrence,
      });
    } else {
      await addTask({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        date: formattedDate,
        time: formattedTime,
        reminderOffset: data.reminderOffset,
        recurrence: data.recurrence,
      });
    }
    navigation.goBack();
  };

  const categories: TaskCategory[] = ['Work', 'Study', 'Personal', 'Health', 'Shopping'];
  const priorities: TaskPriority[] = ['High', 'Medium', 'Low'];
  
  const reminderOptions = [
    { label: 'No Reminder', value: -1 },
    { label: 'At event time', value: 0 },
    { label: '5 minutes before', value: 5 },
    { label: '10 minutes before', value: 10 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
  ];

  const recurrenceOptions: TaskRecurrence[] = ['None', 'Daily', 'Weekly', 'Monthly'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Form Body */}
        <View style={[themeStyles.glassCard, styles.formCard]}>
          {/* Title */}
          <Text style={[styles.label, { color: colors.text }]}>Task Title</Text>
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Task title is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: errors.title ? colors.danger : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="What needs to be done?"
                  placeholderTextColor={colors.textSecondary + '80'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />
          {errors.title && <Text style={[styles.errorText, { color: colors.danger }]}>{String(errors.title.message)}</Text>}

          {/* Description */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Description (Optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.textAreaWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textArea, { color: colors.text }]}
                  placeholder="Add details, links, or notes..."
                  placeholderTextColor={colors.textSecondary + '80'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          />

          {/* Category Horizontal Selector */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroller}>
                {categories.map((cat) => {
                  const catColors = {
                    Work: colors.work,
                    Study: colors.study,
                    Personal: colors.personal,
                    Health: colors.health,
                    Shopping: colors.shopping,
                  };
                  const isSelected = value === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.pillTab,
                        {
                          backgroundColor: isSelected ? catColors[cat] : colors.background,
                          borderColor: isSelected ? catColors[cat] : colors.border,
                        },
                      ]}
                      onPress={() => onChange(cat)}
                    >
                      <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          />

          {/* Priority Select */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Priority Level</Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={styles.row}>
                {priorities.map((prio) => {
                  const prioColors = {
                    High: colors.high,
                    Medium: colors.medium,
                    Low: colors.low,
                  };
                  const isSelected = value === prio;
                  return (
                    <TouchableOpacity
                      key={prio}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor: isSelected ? prioColors[prio] + '15' : colors.background,
                          borderColor: isSelected ? prioColors[prio] : colors.border,
                        },
                      ]}
                      onPress={() => onChange(prio)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color: isSelected ? prioColors[prio] : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {prio}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />

          {/* Date & Time Row */}
          <View style={[styles.row, { marginTop: 16 }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {formatDisplayDate(getLocalDateString(date))}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: colors.text }]}>Time</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {formatDisplayTime(`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Native Picker Components */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
            />
          )}

          {/* Reminder Dropdown */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Reminder Option</Text>
          <Controller
            control={control}
            name="reminderOffset"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroller}>
                {reminderOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pillTab,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => onChange(opt.value)}
                    >
                      <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          />

          {/* Recurrence Selector */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Repeat Task</Text>
          <Controller
            control={control}
            name="recurrence"
            render={({ field: { onChange, value } }) => (
              <View style={styles.row}>
                {recurrenceOptions.map((opt) => {
                  const isSelected = value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.recurrenceBtn,
                        {
                          backgroundColor: isSelected ? colors.primary + '15' : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => onChange(opt)}
                    >
                      <Text
                        style={[
                          styles.recurrenceText,
                          {
                            color: isSelected ? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit(onSubmit)} activeOpacity={0.8} style={styles.submitBtnWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
    fontSize: 15,
  },
  textAreaWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 100,
  },
  textArea: {
    height: '100%',
    fontSize: 15,
  },
  pillScroller: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pillTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  priorityText: {
    fontSize: 13,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  recurrenceBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  recurrenceText: {
    fontSize: 13,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtnWrapper: {
    marginTop: 32,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitBtn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
