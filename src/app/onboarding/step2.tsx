import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, X, ArrowRight } from 'lucide-react-native';
import C from '../../constants/colors';

export default function OnboardingStep2() {
  const router = useRouter();
  const { villageId } = useLocalSearchParams();
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<{ initials: string; name: string }[]>([]);

  const addInvite = () => {
    if (!inviteEmail.trim()) return;
    const name = inviteEmail.split('@')[0];
    setInvites(prev => [...prev, { initials: name[0].toUpperCase(), name }]);
    setInviteEmail('');
  };

  const removeInvite = (idx: number) => {
    setInvites(prev => prev.filter((_, i) => i !== idx));
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
          <Text style={styles.headerTitle}>High-Performance Care</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color={C.onSurfaceVariant} />
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
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
          <View style={[styles.progressBar, styles.progressBarInactive]} />
          <Text style={styles.progressLabel}>STEP 2 OF 3</Text>
        </View>

        <Text style={styles.heading}>Invite Care Team</Text>
        <Text style={styles.subheading}>
          Add family members or medical professionals to help coordinate care tasks.
        </Text>

        <View style={styles.card}>
          <View style={styles.inviteRow}>
            <View style={styles.inviteInputWrap}>
              <Mail size={18} color={C.onSurfaceVariant} style={styles.inviteIcon} />
              <TextInput
                style={styles.inviteInput}
                placeholder="caregiver@email.com"
                placeholderTextColor={C.outline}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={addInvite}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={addInvite}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {invites.length > 0 && (
            <View style={styles.chipsRow}>
              {invites.map((inv, idx) => (
                <View key={idx} style={styles.chip}>
                  <View style={styles.chipAvatar}>
                    <Text style={styles.chipAvatarText}>{inv.initials}</Text>
                  </View>
                  <Text style={styles.chipName}>{inv.name}</Text>
                  <TouchableOpacity onPress={() => removeInvite(idx)}>
                    <X size={14} color={C.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {invites.length === 0 && (
            <Text style={styles.emptyInvite}>No team members added yet. This step is optional.</Text>
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push(`/onboarding/step3?villageId=${villageId}`)}
        >
          <Text style={styles.ctaBtnText}>Continue</Text>
          <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push(`/onboarding/step3?villageId=${villageId}`)}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
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
  headerIcon: { fontSize: 18, color: C.primaryContainer },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.primary },
  headerDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, opacity: 0.3 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  progressBar: { width: 48, height: 6, borderRadius: 3, backgroundColor: C.primaryContainer },
  progressBarInactive: { backgroundColor: C.surfaceContainerHigh },
  progressLabel: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, opacity: 0.6 },

  heading: { fontSize: 26, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, marginBottom: 6 },
  subheading: { fontSize: 14, color: C.onSurfaceVariant, marginBottom: 20, lineHeight: 22 },

  card: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },

  inviteRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inviteInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inviteIcon: { marginRight: 10 },
  inviteInput: { flex: 1, fontSize: 14, color: C.onSurface },
  addBtn: {
    backgroundColor: C.onSurface, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  addBtnText: { color: C.surface, fontSize: 14, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8,
  },
  chipAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.primaryContainer + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  chipAvatarText: { fontSize: 10, fontWeight: '700', color: C.primary },
  chipName: { fontSize: 12, fontWeight: '600', color: C.onSurface },

  emptyInvite: { fontSize: 13, color: C.onSurfaceVariant, textAlign: 'center', opacity: 0.7 },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16,
    backgroundColor: C.primaryContainer,
    marginBottom: 12,
    shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 16, elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 14, color: C.onSurfaceVariant, fontWeight: '500' },
});
