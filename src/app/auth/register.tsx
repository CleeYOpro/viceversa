import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authSchema } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, ArrowRight, HeadphonesIcon } from 'lucide-react-native';
import C from '../../constants/colors';

const registerSchema = authSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function Register() {
  const { register, loading } = useAuthStore();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    try {
      await register(data.email, data.password, data.displayName);
      router.replace('/onboarding/step1');
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerIcon}>✚</Text>
          <Text style={styles.headerTitle}>CareSync AI</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
          <Text style={styles.headerAction}>Log In</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepNumActive}>1</Text>
            </View>
            <Text style={styles.stepLabelActive}>ACCOUNT</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, styles.stepDim]}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepLabel}>PROFILE</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, styles.stepDim]}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>3</Text>
            </View>
            <Text style={styles.stepLabel}>VERIFY</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          Create your{' '}
          <Text style={styles.headingAccent}>care profile</Text>
        </Text>
        <Text style={styles.subheading}>
          Join the next generation of high-performance health monitoring and management.
        </Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>Sign up with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Full Name */}
        <Text style={styles.label}>FULL NAME</Text>
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputRow}>
              <User size={20} color={C.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Johnathan Doe"
                placeholderTextColor={C.outline}
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />
        {errors.displayName && <Text style={styles.fieldError}>{String(errors.displayName.message)}</Text>}

        {/* Email */}
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputRow}>
              <Mail size={20} color={C.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="care@example.com"
                placeholderTextColor={C.outline}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}
        />
        {errors.email && <Text style={styles.fieldError}>{String(errors.email.message)}</Text>}

        {/* Password */}
        <Text style={styles.label}>PASSWORD</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputRow}>
              <Lock size={20} color={C.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••••••"
                placeholderTextColor={C.outline}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                <Eye size={20} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && <Text style={styles.fieldError}>{String(errors.password.message)}</Text>}

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(p => !p)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.ctaBtnText}>{loading ? 'Creating...' : 'Continue'}</Text>
          {!loading && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {/* Support */}
        <View style={styles.supportBox}>
          <View style={styles.supportIcon}>
            <HeadphonesIcon size={22} color={C.primaryContainer} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Need help setting up?</Text>
            <Text style={styles.supportSub}>Our concierge care team is available 24/7</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.surface },
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: C.surface,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { fontSize: 20, color: C.primaryContainer },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.primary, letterSpacing: -0.3 },
  headerAction: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  headerDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, opacity: 0.4 },

  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  progressStep: { alignItems: 'center', gap: 6 },
  stepDim: { opacity: 0.4 },
  stepCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: C.primaryContainer,
    shadowColor: C.primaryContainer, shadowOpacity: 0.35, shadowRadius: 8, elevation: 3,
  },
  stepNum: { fontSize: 14, fontWeight: '700', color: C.onSurfaceVariant },
  stepNumActive: { fontSize: 14, fontWeight: '700', color: '#fff' },
  stepLabel: { fontSize: 10, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 1 },
  stepLabelActive: { fontSize: 10, fontWeight: '700', color: C.onSurface, letterSpacing: 1 },
  progressLine: { flex: 1, height: 2, backgroundColor: C.surfaceContainerHigh, marginHorizontal: 8, marginBottom: 20 },

  heading: { fontSize: 30, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, marginBottom: 10, lineHeight: 36 },
  headingAccent: { color: C.primaryContainer },
  subheading: { fontSize: 14, color: C.onSurfaceVariant, lineHeight: 22, marginBottom: 28 },

  error: { color: C.error, marginBottom: 12, textAlign: 'center', fontSize: 14 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, height: 56, width: '100%', marginBottom: 20,
    borderWidth: 2, borderColor: C.surfaceContainerHigh,
  },
  googleG: { fontSize: 18, fontWeight: '900', color: C.onSurface, marginRight: 10 },
  googleText: { fontSize: 15, fontWeight: '600', color: C.onSurface },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.surfaceContainerHigh },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: C.onSurfaceVariant },

  label: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: C.onSurfaceVariant, marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, height: 56,
    width: '100%', marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: C.onSurface, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  fieldError: { color: C.error, fontSize: 12, marginTop: -12, marginBottom: 8 },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 2, borderColor: C.surfaceContainerHigh,
    backgroundColor: C.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, color: C.onSurfaceVariant, lineHeight: 20 },
  termsLink: { color: C.primaryContainer, fontWeight: '600' },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 12, width: '100%',
    backgroundColor: C.primaryContainer,
    marginBottom: 40,
    shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  supportBox: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16, padding: 20,
  },
  supportIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  supportTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginBottom: 2 },
  supportSub: { fontSize: 12, color: C.onSurfaceVariant },
});
