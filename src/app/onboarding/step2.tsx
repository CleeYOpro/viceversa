import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, X, ArrowRight, Camera } from 'lucide-react-native';
import C from '../../constants/colors';

export default function OnboardingStep2() {
  const router = useRouter();
  const { villageId, inviteCode } = useLocalSearchParams();

  const [recipientName, setRecipientName] = useState('Margaret');
  const [age, setAge] = useState('82');
  const [conditions, setConditions] = useState('Dementia, Hypertension');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState([{ initials: 'D', name: 'Dr. Smith' }]);

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

        {/* Create Care Recipient */}
        <Text style={styles.heading}>Create Care Recipient</Text>
        <Text style={styles.subheading}>Personalize the care dashboard for your loved one.</Text>

        <View style={styles.card}>
          {/* Photo Upload */}
          <View style={styles.photoWrap}>
            <View style={styles.photoCircle}>
              <Text style={styles.photoIcon}>👤</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera size={16} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.uploadLabel}>UPLOAD PHOTO</Text>

          {/* Name */}
          <Text style={styles.fieldLabel}>RECIPIENT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor={C.outline}
            value={recipientName}
            onChangeText={setRecipientName}
          />

          {/* Age + Conditions */}
          <View style={styles.twoCol}>
            <View style={styles.colSmall}>
              <Text style={styles.fieldLabel}>AGE</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={C.outline}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.colLarge}>
              <Text style={styles.fieldLabel}>PRIMARY CONDITIONS</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Diabetes"
                placeholderTextColor={C.outline}
                value={conditions}
                onChangeText={setConditions}
              />
            </View>
          </View>
        </View>

        {/* Invite Care Team */}
        <View style={styles.inviteHeader}>
          <Text style={styles.inviteTitle}>Invite Care Team</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>OPTIONAL</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.inviteDesc}>
            Add family members or medical professionals to help coordinate care tasks.
          </Text>
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
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={addInvite}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Invite chips */}
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
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push(`/onboarding/step3?villageId=${villageId}`)}
        >
          <Text style={styles.ctaBtnText}>Complete Setup</Text>
          <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.termsNote}>By completing setup, you agree to our Terms of Service.</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.primary, letterSpacing: -0.3 },
  headerDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, opacity: 0.3 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  progressBar: { width: 48, height: 6, borderRadius: 3, backgroundColor: C.primaryContainer },
  progressBarInactive: { backgroundColor: C.surfaceContainerHigh },
  progressLabel: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, opacity: 0.6 },

  heading: { fontSize: 26, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, marginBottom: 6 },
  subheading: { fontSize: 14, color: C.onSurfaceVariant, marginBottom: 20 },

  card: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },

  photoWrap: { alignItems: 'center', marginBottom: 8, position: 'relative', alignSelf: 'center' },
  photoCircle: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: C.surfaceContainerHighest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: C.surfaceContainerLowest,
  },
  photoIcon: { fontSize: 40 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  uploadLabel: {
    fontSize: 11, fontWeight: '700', color: C.primary,
    letterSpacing: 2, textAlign: 'center', marginBottom: 24,
  },

  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 1.5, marginBottom: 8,
  },
  input: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 15, fontWeight: '600', color: C.onSurface, marginBottom: 16,
  },

  twoCol: { flexDirection: 'row', gap: 12 },
  colSmall: { flex: 1 },
  colLarge: { flex: 2 },

  inviteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  inviteTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  optionalBadge: {
    backgroundColor: C.primary + '18', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  optionalText: { fontSize: 10, fontWeight: '700', color: C.primary },

  inviteDesc: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 20, marginBottom: 16 },
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

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16, width: '100%',
    backgroundColor: C.primaryContainer,
    marginBottom: 16,
    shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 16, elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  termsNote: { textAlign: 'center', fontSize: 12, color: C.onSurfaceVariant, opacity: 0.6 },
});
