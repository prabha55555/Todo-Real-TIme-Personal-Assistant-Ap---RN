import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useStore } from '../context/store';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const users = useStore((state) => state.users);
  const resetPassword = useStore((state) => state.resetPassword);
  const { colors, styles: themeStyles } = useAppTheme();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailToReset, setEmailToReset] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control: emailControl, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    defaultValues: { email: '' }
  });

  const { control: passControl, handleSubmit: handlePassSubmit, formState: { errors: passErrors }, watch } = useForm({
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onEmailSubmit = (data: any) => {
    setErrorMessage(null);
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (!exists) {
      setErrorMessage('No account matches this email address.');
      return;
    }
    setEmailToReset(data.email);
    setStep(2);
  };

  const onPasswordSubmit = (data: any) => {
    setErrorMessage(null);
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    const result = resetPassword(emailToReset, data.password);
    if (result.success) {
      setStep(3);
    } else {
      setErrorMessage(result.error || 'Failed to update password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {step !== 3 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1 && 'Enter your email to verify your offline account'}
            {step === 2 && `Choose a new secure password for ${emailToReset}`}
            {step === 3 && 'Password successfully updated!'}
          </Text>
        </View>

        <View style={[themeStyles.glassCard, styles.formCard]}>
          {errorMessage && (
            <View style={[styles.errorContainer, { backgroundColor: colors.danger + '15' }]}>
              <AlertCircle size={18} color={colors.danger} />
              <Text style={[styles.errorAlertText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
              <Controller
                control={emailControl}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.background,
                        borderColor: emailErrors.email ? colors.danger : colors.border,
                      },
                    ]}
                  >
                    <Mail size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter registered email"
                      placeholderTextColor={colors.textSecondary + '80'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {emailErrors.email && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{emailErrors.email.message}</Text>
              )}

              <TouchableOpacity
                onPress={handleEmailSubmit(onEmailSubmit)}
                activeOpacity={0.8}
                style={styles.submitBtnWrapper}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitBtnText}>Verify Email</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
              <Controller
                control={passControl}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.background,
                        borderColor: passErrors.password ? colors.danger : colors.border,
                      },
                    ]}
                  >
                    <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="New password"
                      placeholderTextColor={colors.textSecondary + '80'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {passErrors.password && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{passErrors.password.message}</Text>
              )}

              <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Confirm Password</Text>
              <Controller
                control={passControl}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm password',
                  validate: (value) => value === watch('password') || 'Passwords do not match',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.background,
                        borderColor: passErrors.confirmPassword ? colors.danger : colors.border,
                      },
                    ]}
                  >
                    <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Confirm password"
                      placeholderTextColor={colors.textSecondary + '80'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {passErrors.confirmPassword && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {passErrors.confirmPassword.message}
                </Text>
              )}

              <TouchableOpacity
                onPress={handlePassSubmit(onPasswordSubmit)}
                activeOpacity={0.8}
                style={styles.submitBtnWrapper}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitBtnText}>Update Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.successWrapper}>
              <CheckCircle size={56} color={colors.success} style={styles.successIcon} />
              <Text style={[styles.successTextMain, { color: colors.text }]}>Reset Completed!</Text>
              <Text style={[styles.successTextSub, { color: colors.textSecondary }]}>
                Your local password has been changed. You can now use your new password to log in.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
                style={[styles.submitBtnWrapper, { width: '100%' }]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitBtnText}>Return to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorAlertText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  submitBtnWrapper: {
    marginTop: 24,
    borderRadius: 12,
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
  successWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTextMain: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successTextSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
});
