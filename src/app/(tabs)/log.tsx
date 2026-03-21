import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Platform,
} from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useVillageStore } from '../../stores/useVillageStore';
// useVillageStore is also used directly for refresh after save
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Clock, Camera, Send, ChevronDown } from 'lucide-react-native';
import C from '../../constants/colors';

const OBSERVATION_TAGS = ['Confusion', 'Fatigue', 'Agitation', 'High Pain', 'Decreased Appetite', 'Good Mood', 'Restless'];
const MEDICATIONS = ['Donepezil 10mg', 'Memantine 20mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'Metformin 500mg', 'Aspirin 81mg', 'Vitamin D3', 'No medication given'];

export default function LogScreen() {
  const { user } = useAuthStore();
  const { activeVillageId, lovedOne } = useVillageStore();

  const [selectedMed, setSelectedMed] = useState('');
  const [showMedPicker, setShowMedPicker] = useState(false);
  const [bp, setBp] = useState('');
  const [glucose, setGlucose] = useState('');
  const [temp, setTemp] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!activeVillageId || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'patients', activeVillageId, 'healthLogs'), {
        type: bp ? 'bp' : selectedMed ? 'medication' : 'note',
        timestamp: Timestamp.now(),
        authorId: user.uid,
        authorName: user.displayName ?? 'Caregiver',
        isRestricted: false,
        notes: [
          selectedMed && `Medication: ${selectedMed}`,
          selectedTags.length && `Observations: ${selectedTags.join(', ')}`,
          notes,
        ].filter(Boolean).join('\n'),
        vitals: {
          ...(bp ? { bp } : {}),
          ...(glucose ? { glucose: parseFloat(glucose) } : {}),
          ...(temp ? { temperature: parseFloat(temp) } : {}),
        },
      });
      // Refresh store data
      useVillageStore.getState().loadPatientData(activeVillageId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setSelectedMed(''); setBp(''); setGlucose(''); setTemp('');
      setSelectedTags([]); setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{lovedOne?.name?.[0] ?? 'E'}</Text>
          </View>
          <Text style={styles.headerTitle}>New Care Log</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <X size={22} color={C.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Log Time */}
        <View style={styles.timeRow}>
          <View style={styles.timeLeft}>
            <Clock size={18} color={C.primary} />
            <Text style={styles.timeLabel}>LOG TIME</Text>
          </View>
          <Text style={styles.timeValue}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        {/* Medication */}
        <Text style={styles.sectionLabel}>MEDICATION GIVEN</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setShowMedPicker(p => !p)}>
          <Text style={[styles.selectText, !selectedMed && styles.selectPlaceholder]}>
            {selectedMed || 'Select Medication'}
          </Text>
          <ChevronDown size={18} color={C.onSurfaceVariant} />
        </TouchableOpacity>
        {showMedPicker && (
          <View style={styles.picker}>
            {MEDICATIONS.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.pickerItem, selectedMed === m && styles.pickerItemActive]}
                onPress={() => { setSelectedMed(m); setShowMedPicker(false); }}
              >
                <Text style={[styles.pickerItemText, selectedMed === m && styles.pickerItemTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Vital Signs */}
        <Text style={styles.sectionLabel}>VITAL SIGNS</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>BP (mmHg)</Text>
            <TextInput
              style={styles.vitalInput}
              placeholder="120/80"
              placeholderTextColor={C.outline}
              value={bp}
              onChangeText={setBp}
            />
          </View>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>GLUCOSE (mg/dL)</Text>
            <TextInput
              style={styles.vitalInput}
              placeholder="95"
              placeholderTextColor={C.outline}
              value={glucose}
              onChangeText={setGlucose}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.vitalCard, styles.vitalCardWide]}>
            <Text style={styles.vitalLabel}>TEMP (°F)</Text>
            <TextInput
              style={styles.vitalInput}
              placeholder="98.6"
              placeholderTextColor={C.outline}
              value={temp}
              onChangeText={setTemp}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Observations */}
        <Text style={styles.sectionLabel}>OBSERVATIONS</Text>
        <View style={styles.observationsCard}>
          <View style={styles.tagsRow}>
            {OBSERVATION_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Describe behavior or concerns..."
            placeholderTextColor={C.outline}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photo */}
        <Text style={styles.sectionLabel}>VISUAL LOG</Text>
        <TouchableOpacity style={styles.photoBox}>
          <View style={styles.photoIconWrap}>
            <Camera size={28} color={C.primary} />
          </View>
          <Text style={styles.photoTitle}>Add Photo</Text>
          <Text style={styles.photoSub}>Upload meal, wound, or medication label</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save to Team'}</Text>
          {!saving && !saved && <Send size={20} color={C.onPrimaryContainer} style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.onSurface },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  timeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24,
  },
  timeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: C.onSurfaceVariant },
  timeValue: { fontSize: 14, fontWeight: '700', color: C.primary },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 2,
    color: C.onSurfaceVariant, opacity: 0.6, marginBottom: 10,
  },

  selectBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.surfaceContainerLowest, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 18, marginBottom: 4,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  selectText: { fontSize: 15, fontWeight: '600', color: C.onSurface },
  selectPlaceholder: { color: C.outline },
  picker: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 12,
    marginBottom: 24, overflow: 'hidden',
    shadowColor: '#5a4136', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.surfaceContainerHigh },
  pickerItemActive: { backgroundColor: C.primaryContainer + '18' },
  pickerItemText: { fontSize: 14, color: C.onSurface },
  pickerItemTextActive: { color: C.primary, fontWeight: '700' },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  vitalCard: {
    flex: 1, minWidth: '45%', backgroundColor: C.surfaceContainerLow,
    borderRadius: 20, padding: 20, height: 128, justifyContent: 'space-between',
  },
  vitalCardWide: { minWidth: '100%' },
  vitalLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: C.onSurfaceVariant },
  vitalInput: { fontSize: 26, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, padding: 0 },

  observationsCard: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 24,
    padding: 20, marginBottom: 24, gap: 16,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  tagActive: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
  tagText: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  tagTextActive: { color: C.onPrimaryContainer },
  notesInput: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 12,
    padding: 14, fontSize: 14, color: C.onSurface, minHeight: 100,
  },

  photoBox: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: C.outlineVariant,
    borderRadius: 24, padding: 40, alignItems: 'center', gap: 8,
    backgroundColor: C.surfaceContainerLow + '50', marginBottom: 24,
  },
  photoIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  photoTitle: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  photoSub: { fontSize: 12, color: C.onSurfaceVariant, textAlign: 'center' },

  saveBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 24, paddingTop: 16,
    backgroundColor: C.surface,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 64, borderRadius: 20,
    backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: C.onPrimaryContainer },
});
