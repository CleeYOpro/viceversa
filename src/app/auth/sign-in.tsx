import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react-native';
import C from '../../constants/colors';

export default function SignIn() {
  const { signIn, loading } = useAuthStore();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch {
      setErrorMsg('Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoInner}>
            <Text style={styles.logoIcon}>✚</Text>
          </View>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeIcon}>♥</Text>
          </View>
        </View>

        <Text style={styles.appName}>KomeKare</Text>
        <Text style={styles.tagline}>HIGH-PERFORMANCE CARE</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

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
                placeholder="caregiver@hospital.com"
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
        <View style={styles.labelRow}>
          <Text style={styles.label}>PASSWORD</Text>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputRow}>
              <Lock size={20} color={C.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={C.outline}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                {showPassword
                  ? <EyeOff size={20} color={C.onSurfaceVariant} />
                  : <Eye size={20} color={C.onSurfaceVariant} />}
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && <Text style={styles.fieldError}>{String(errors.password.message)}</Text>}

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
          <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          {!loading && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>Login with Google</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New to KomeKare? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Create an Account</Text>
          </TouchableOpacity>
        </View>

        {/* Security note */}
        <View style={styles.securityBox}>
          <ShieldCheck size={18} color={C.onSurfaceVariant} style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={styles.securityText}>
            Your data security is our priority. By signing in, you agree to KomeKare's{' '}
            <Text style={styles.securityLink}>Terms of Service</Text> and{' '}
            <Text style={styles.securityLink}>Privacy Policy</Text>. High-Performance Care encryption is active.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.surface },
  content: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72, paddingBottom: 48 },

  logoBox: { width: 80, height: 80, marginBottom: 24, position: 'relative' },
  logoInner: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5a4136', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  logoIcon: { fontSize: 40, color: C.primaryContainer },
  logoBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoBadgeIcon: { fontSize: 12, color: '#fff' },

  appName: { fontSize: 30, fontWeight: '800', color: C.onSurface, marginBottom: 4, letterSpacing: -0.5 },
  tagline: { fontSize: 11, letterSpacing: 2, color: C.onSurfaceVariant, marginBottom: 40, opacity: 0.8 },

  error: { color: C.error, marginBottom: 12, textAlign: 'center', fontSize: 14 },

  label: {
    alignSelf: 'flex-start', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, color: C.onSurfaceVariant, marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignSelf: 'stretch', alignItems: 'center', marginBottom: 8,
  },
  forgotText: { fontSize: 12, color: C.primary, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, paddingHorizontal: 16, height: 56,
    width: '100%', marginBottom: 16,
    shadowColor: '#5a4136', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: C.onSurface },
  eyeBtn: { padding: 4 },
  fieldError: { color: C.error, fontSize: 12, alignSelf: 'flex-start', marginTop: -12, marginBottom: 8 },

  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, height: 56, width: '100%',
    backgroundColor: C.primaryContainer,
    marginTop: 8, marginBottom: 24,
    shadowColor: C.primaryContainer, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.surfaceContainerHigh },
  dividerText: { marginHorizontal: 12, fontSize: 10, color: C.onSurfaceVariant, letterSpacing: 1.5, opacity: 0.6 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, height: 56, width: '100%', marginBottom: 28,
    borderWidth: 1, borderColor: C.surfaceContainerHigh,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  googleG: { fontSize: 18, fontWeight: '900', color: C.onSurface, marginRight: 10 },
  googleText: { fontSize: 15, fontWeight: '600', color: C.onSurface },

  registerRow: { flexDirection: 'row', marginBottom: 32 },
  registerText: { fontSize: 14, color: C.onSurfaceVariant },
  registerLink: { fontSize: 14, color: C.primary, fontWeight: '700' },

  securityBox: {
    flexDirection: 'row', backgroundColor: C.surfaceContainerLow,
    borderRadius: 16, padding: 16, width: '100%',
    borderWidth: 1, borderColor: C.surfaceContainerHigh,
  },
  securityText: { flex: 1, fontSize: 11, color: C.onSurfaceVariant, lineHeight: 17, opacity: 0.8 },
  securityLink: { fontWeight: '700', color: C.onSurface },
});
