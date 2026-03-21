import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { useVillageStore } from '../../stores/useVillageStore';
import { db } from '../../lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { X, Camera, ArrowRight } from 'lucide-react-native';
import C from '../../constants/colors';

export default function OnboardingStep1() {
  const [recipientName, setRecipientName] = useState('');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { setActiveVillage } = useVillageStore();

  const handleContinue = async () => {
    if (!recipientName.trim() || !user) return;
    setLoading(true);
    try {
      const villageId = `village_${Date.now()}`;
      const inviteCode = btoa(villageId + '_encode').substring(0, 8).toUpperCase();

      await setDoc(doc(db, 'villages', villageId), {
        id: villageId,
        name: recipientName.trim(),
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        inviteCode,
      });

      await setDoc(doc(db, 'villages', villageId, 'members', user.uid), {
        userId: user.uid,
        role: 'admin',
        joinedAt: Timestamp.now(),
        displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
      });

      await setDoc(doc(db, 'villages', villageId, 'lovedOne', 'profile'), {
        name: recipientName.trim(),
        dob: '',
        conditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
        allergies: [],
        emergencyContact: { name: '', phone: '', relationship: '' },
      });

      await setDoc(doc(db, 'users', user.uid), {
        villageIds: [villageId],
        email: user.email,
        expoPushToken: '',
      }, { merge: true });

      setActiveVillage(villageId);
      router.push(`/onboarding/step2?villageId=${villageId}&inviteCode=${inviteCode}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
          <View style={[styles.progressBar, styles.progressBarInactive]} />
          <View style={[styles.progressBar, styles.progressBarInactive]} />
          <Text style={styles.progressLabel}>STEP 1 OF 3</Text>
        </View>

        <Text style={styles.heading}>Create Care Recipient</Text>
        <Text style={styles.subheading}>Personalize the care dashboard for your loved one.</Text>

        <View style={styles.card}>
          {/* Photo */}
          <View style={styles.photoWrap}>
            <View style={styles.photoCircle}>
              <Text style={styles.photoIcon}>👤</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera size={16} color="#fff" />
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

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, (!recipientName.trim() || loading) && styles.ctaBtnDisabled]}
          onPress={handleContinue}
          disabled={!recipientName.trim() || loading}
        >
          <Text style={styles.ctaBtnText}>{loading ? 'Creating...' : 'Continue'}</Text>
          {!loading && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        <Text style={styles.termsNote}>By continuing, you agree to our Terms of Service.</Text>
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
  subheading: { fontSize: 14, color: C.onSurfaceVariant, marginBottom: 20 },

  card: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },

  photoWrap: { alignSelf: 'center', marginBottom: 8, position: 'relative' },
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

  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 15, fontWeight: '600', color: C.onSurface, marginBottom: 16,
  },

  twoCol: { flexDirection: 'row', gap: 12 },
  colSmall: { flex: 1 },
  colLarge: { flex: 2 },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16, width: '100%',
    backgroundColor: C.primaryContainer,
    marginBottom: 16,
    shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 16, elevation: 4,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  termsNote: { textAlign: 'center', fontSize: 12, color: C.onSurfaceVariant, opacity: 0.6 },
});
