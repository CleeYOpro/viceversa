import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Plus, ArrowRight, Shield } from 'lucide-react-native';
import { useVillageStore } from '../stores/useVillageStore';
import C from '../constants/colors';

export default function PatientEdit() {
  const router = useRouter();
  const { activeVillageId, lovedOne, updateLovedOne, members } = useVillageStore();

  const [name, setName] = useState(lovedOne?.name ?? '');
  const [dob, setDob] = useState(lovedOne?.dob ?? '');
  const [conditions, setConditions] = useState<string[]>(lovedOne?.conditions ?? []);
  const [newCondition, setNewCondition] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const addCondition = () => {
    if (!newCondition.trim()) return;
    setConditions(prev => [...prev, newCondition.trim()]);
    setNewCondition('');
  };

  const removeCondition = (idx: number) => setConditions(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!activeVillageId) return;
    setSaving(true);
    updateLovedOne(activeVillageId, { name, dob, conditions });
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerName}>{name || 'Patient'}</Text>
          <Text style={styles.headerSub}>Profile Setup</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={C.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoCircle}>
            <Text style={styles.photoInitial}>{name[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Text style={styles.editBadgeIcon}>✎</Text>
          </TouchableOpacity>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active Care</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.twoCol}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={C.outline}
            />
          </View>
          <View style={[styles.fieldWrap, { flex: 0.5 }]}>
            <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.outline}
            />
          </View>
        </View>

        {/* Conditions */}
        <Text style={styles.fieldLabel}>PRIMARY CONDITIONS</Text>
        <View style={styles.chipsRow}>
          {conditions.map((c, i) => (
            <TouchableOpacity key={i} style={styles.chip} onPress={() => removeCondition(i)}>
              <Text style={styles.chipText}>{c}</Text>
              <X size={12} color={C.onSurface} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
          <View style={styles.addConditionRow}>
            <TextInput
              style={styles.conditionInput}
              value={newCondition}
              onChangeText={setNewCondition}
              placeholder="Add condition"
              placeholderTextColor={C.outline}
              onSubmitEditing={addCondition}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addConditionBtn} onPress={addCondition}>
              <Plus size={18} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Invite Care Team */}
        <Text style={styles.sectionTitle}>Invite Care Team</Text>
        <Text style={styles.sectionSub}>Shared management for {name}'s vital daily needs.</Text>

        <View style={styles.inviteRow}>
          <View style={styles.inviteInputWrap}>
            <TextInput
              style={styles.inviteInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="caregiver@email.com"
              placeholderTextColor={C.outline}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Team Members */}
        <Text style={styles.fieldLabel}>CURRENT TEAM MEMBERS</Text>
        {members.map(m => (
          <View key={m.userId} style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>{m.displayName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{m.displayName}</Text>
              <Text style={styles.memberRole}>{m.role === 'admin' ? 'Primary Caregiver' : 'Caregiver'}</Text>
            </View>
            {m.role === 'admin' && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Owner</Text>
              </View>
            )}
          </View>
        ))}

        {/* Privacy */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Shield size={20} color={C.primary} />
            <Text style={styles.privacyTitle}>Medical Privacy & Consent</Text>
          </View>
          <Text style={styles.privacyText}>
            By completing this setup, you acknowledge that you have the legal right or power of attorney to manage this patient's medical data. Data is encrypted and shared only with verified care team members.
          </Text>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(p => !p)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              I agree to the Care Recipient Data Processing Terms and Medical Privacy Policy.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Complete Setup'}</Text>
          {!saving && <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20, backgroundColor: C.surface,
  },
  headerName: { fontSize: 26, fontWeight: '900', color: C.primary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },

  photoSection: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  photoCircle: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: C.surface,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  photoInitial: { fontSize: 48, fontWeight: '700', color: C.onSurface },
  editBadge: {
    position: 'absolute', bottom: 28, right: '33%',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: C.surface,
  },
  editBadgeIcon: { color: '#fff', fontSize: 14 },
  activeBadge: {
    marginTop: 12, backgroundColor: C.primary + '18',
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1 },

  twoCol: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  fieldWrap: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: C.onSurfaceVariant, marginBottom: 8 },
  input: {
    height: 56, backgroundColor: C.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, fontWeight: '600', color: C.onSurface,
  },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    height: 44, paddingHorizontal: 16, borderRadius: 99,
    backgroundColor: C.secondaryContainer,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  addConditionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conditionInput: {
    height: 44, backgroundColor: C.surfaceContainerHigh,
    borderRadius: 99, paddingHorizontal: 16,
    fontSize: 14, color: C.onSurface, minWidth: 120,
  },
  addConditionBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: C.onSurfaceVariant, marginBottom: 16 },

  inviteRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  inviteInputWrap: {
    flex: 1, height: 56, backgroundColor: C.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center',
  },
  inviteInput: { fontSize: 14, color: C.onSurface },
  addBtn: {
    height: 56, paddingHorizontal: 24, borderRadius: 12,
    backgroundColor: C.onSurface, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: C.surface },

  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceContainerLow, borderRadius: 14,
    padding: 14, marginBottom: 8,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 16, fontWeight: '700', color: C.primary },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  memberRole: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 1 },
  ownerBadge: {
    backgroundColor: C.primary + '18', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ownerBadgeText: { fontSize: 11, fontWeight: '700', color: C.primary },

  privacyCard: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 20,
    padding: 20, marginTop: 24, gap: 12,
  },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  privacyTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  privacyText: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, marginTop: 1,
    borderWidth: 2, borderColor: C.outlineVariant,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: C.onSurface, lineHeight: 20 },

  footer: {
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingTop: 16,
    backgroundColor: C.surface + 'CC',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 64, borderRadius: 20, backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 16, elevation: 6,
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
