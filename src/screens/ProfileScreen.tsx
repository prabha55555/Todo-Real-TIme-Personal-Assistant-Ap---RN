import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { User as UserIcon, Moon, Bell, Shield, LogOut, Check, X, Database, RotateCcw } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatDisplayTime } from '../utils/date';

export default function ProfileScreen() {
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const resetAllData = useStore((state) => state.resetAllData);
  
  const { colors, styles: themeStyles } = useAppTheme();

  // Modal and picker state
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [isExportMode, setIsExportMode] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleExport = () => {
    const dataStr = exportData();
    setBackupText(dataStr);
    setIsExportMode(true);
    setBackupModalVisible(true);
  };

  const handleImport = () => {
    setBackupText('');
    setIsExportMode(false);
    setBackupModalVisible(true);
  };

  const submitImport = () => {
    if (!backupText.trim()) {
      Alert.alert('Error', 'Please paste the backup data first.');
      return;
    }
    const result = importData(backupText);
    if (result.success) {
      Alert.alert('Success', 'App data restored successfully.');
      setBackupModalVisible(false);
    } else {
      Alert.alert('Import Failed', result.error || 'Invalid backup string.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'WARNING: This will delete all your local tasks and reset settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetAllData() },
      ]
    );
  };

  const handleDailyReminderTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      updateSettings({ dailyReminderTime: `${hours}:${minutes}` });
    }
  };

  // Convert settings time to Date object for picker
  const getDailyReminderTimeDate = () => {
    const [hours, minutes] = settings.dailyReminderTime.split(':');
    const d = new Date();
    d.setHours(parseInt(hours, 10));
    d.setMinutes(parseInt(minutes, 10));
    return d;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings Profile</Text>
        <UserIcon size={20} color={colors.textSecondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[themeStyles.glassCard, styles.userCard]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {currentUser?.username ? currentUser.username[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{currentUser?.username || 'User'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{currentUser?.email || 'offline@taskflow.ai'}</Text>
          </View>
        </View>

        {/* Theme Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>THEME CONFIG</Text>
        <View style={[themeStyles.glassCard, styles.settingsGroup]}>
          <View style={styles.themeRow}>
            <Moon size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme Mode</Text>
          </View>
          
          <View style={styles.themeSelectorRow}>
            {([
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'System', value: 'system' },
            ] as const).map((mode) => {
              const isSelected = settings.themeMode === mode.value;
              return (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateSettings({ themeMode: mode.value })}
                >
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reminders settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>REMINDERS</Text>
        <View style={[themeStyles.glassCard, styles.settingsGroup]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelCol}>
              <Bell size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Reminders</Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(val) => updateSettings({ dailyReminderEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          {settings.dailyReminderEnabled && (
            <View style={[styles.settingRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>Reminder Time</Text>
              <TouchableOpacity
                style={[styles.timeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {formatDisplayTime(settings.dailyReminderTime)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={getDailyReminderTimeDate()}
              mode="time"
              display="spinner"
              onChange={handleDailyReminderTimeChange}
            />
          )}
        </View>

        {/* Alarms and Vibrations */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ALARM PREFERENCES</Text>
        <View style={[themeStyles.glassCard, styles.settingsGroup]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabelText, { color: colors.text }]}>Play Sound</Text>
            <Switch
              value={settings.alarmSoundEnabled}
              onValueChange={(val) => updateSettings({ alarmSoundEnabled: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.settingRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.settingLabelText, { color: colors.text }]}>Device Vibration</Text>
            <Switch
              value={settings.alarmVibrate}
              onValueChange={(val) => updateSettings({ alarmVibrate: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.settingRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.settingLabelText, { color: colors.text }]}>Snooze Duration</Text>
            <View style={styles.snoozeSelector}>
              {[5, 10, 30].map((mins) => {
                const isSelected = settings.snoozeDuration === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.snoozeTab,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => updateSettings({ snoozeDuration: mins })}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Backup & Management */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA PROTECTION</Text>
        <View style={[themeStyles.glassCard, styles.settingsGroup]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExport}>
            <Database size={20} color={colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Export Backup JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { marginTop: 16 }]} onPress={handleImport}>
            <Database size={20} color={colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Restore Backup JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { marginTop: 16 }]} onPress={handleResetData}>
            <RotateCcw size={20} color={colors.danger} />
            <Text style={[styles.actionLabel, { color: colors.danger, fontWeight: '700' }]}>
              Clear & Reset Application
            </Text>
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={[themeStyles.glassCard, styles.logoutBtn, { borderColor: colors.danger + '30' }]} onPress={logout}>
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out Account</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>TaskFlow AI Offline v1.0.0</Text>
      </ScrollView>

      {/* Backup and Restore Modal */}
      <Modal visible={backupModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isExportMode ? 'Export Backup Data' : 'Restore Backup Data'}
              </Text>
              <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {isExportMode
                ? 'Copy this JSON string and save it to a text file. You can paste it back to restore all tasks.'
                : 'Paste your previously exported backup JSON string below and tap restore.'}
            </Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              multiline
              value={backupText}
              onChangeText={setBackupText}
              selectTextOnFocus={isExportMode}
              editable={!isExportMode || backupText.length > 0}
              placeholder="Paste JSON string here..."
              placeholderTextColor={colors.textSecondary + '80'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setBackupModalVisible(false)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
              
              {!isExportMode && (
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.success }]} onPress={submitImport}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Restore</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    padding: 16,
    marginBottom: 20,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  themeBtnText: {
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingSubLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingLabelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  snoozeSelector: {
    flexDirection: 'row',
  },
  snoozeTab: {
    width: 44,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    height: 120,
    fontSize: 13,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
});
