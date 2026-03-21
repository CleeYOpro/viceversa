import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, Platform,
} from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { Pill, ChevronRight, Plus, AlertTriangle } from 'lucide-react-native';
import C from '../../constants/colors';

// Seeded medications for Eleanor
const DEMO_MEDS = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', schedule: 'Once Daily (AM)', nextDose: 42 },
  { id: '2', name: 'Atorvastatin', dosage: '20mg', schedule: 'Once Daily (PM)', nextDose: 312 },
  { id: '3', name: 'Metformin', dosage: '500mg', schedule: 'Twice Daily', nextDose: 42 },
  { id: '4', name: 'Donepezil', dosage: '10mg', schedule: 'Once Daily (PM)', nextDose: 312 },
  { id: '5', name: 'Memantine', dosage: '20mg', schedule: 'Once Daily (AM)', nextDose: 42 },
];

export default function MedsScreen() {
  const { lovedOne } = useVillageStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [meds, setMeds] = useState(DEMO_MEDS);

  const handleAdd = () => {
    if (!name.trim()) return;
    setMeds(prev => [...prev, {
      id: String(Date.now()), name, dosage,
      schedule: 'Once Daily', nextDose: 60,
    }]);
    setName(''); setDosage('');
    setModalVisible(false);
  };

  const nextMed = meds.reduce((a, b) => a.nextDose < b.nextDose ? a : b);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{lovedOne?.name?.[0] ?? 'E'}</Text>
          </View>
          <Text style={styles.headerTitle}>{lovedOne?.name ?? 'Eleanor'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Next Dose Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>NEXT SCHEDULED DOSE</Text>
          <View style={styles.heroCountRow}>
            <Text style={styles.heroCount}>{nextMed.nextDose}</Text>
            <Text style={styles.heroUnit}>mins</Text>
          </View>
          <View style={styles.heroPill}>
            <Pill size={20} color="#fff" />
            <View>
              <Text style={styles.heroPillName}>{nextMed.name}</Text>
              <Text style={styles.heroPillSub}>{nextMed.dosage} • {nextMed.schedule}</Text>
            </View>
          </View>
          {/* Decorative ring */}
          <View style={styles.heroRing} />
        </View>

        {/* AI Interaction Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <AlertTriangle size={22} color={C.primaryContainer} />
          </View>
          <View style={styles.alertBody}>
            <View style={styles.alertTopRow}>
              <Text style={styles.alertEyebrow}>CARE INTELLIGENCE</Text>
            </View>
            <Text style={styles.alertTitle}>Vitamin K Interaction Warning</Text>
            <Text style={styles.alertText}>
              Recent meal logs indicate high spinach intake. Monitor for interactions with{' '}
              <Text style={styles.alertBold}>Atorvastatin</Text> as Vitamin K may decrease its efficacy.
            </Text>
          </View>
        </View>

        {/* Active Medications */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Medications</Text>
            <Text style={styles.sectionSub}>{meds.length} Prescriptions active this week</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewHistory}>View History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.medList}>
          {meds.map(med => (
            <TouchableOpacity key={med.id} style={styles.medCard}>
              <View style={styles.medIconWrap}>
                <Pill size={28} color={C.primary} />
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <View style={styles.medMeta}>
                  <Text style={styles.medMetaText}>{med.dosage}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.medMetaText}>{med.schedule}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={C.outline} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Compliance */}
        <View style={styles.complianceCard}>
          <View>
            <Text style={styles.complianceLabel}>MONTHLY COMPLIANCE</Text>
            <Text style={styles.complianceValue}>98.4%</Text>
          </View>
          <View style={styles.chartWrap}>
            {[0.5, 0.75, 0.65, 0.95, 1].map((h, i) => (
              <View
                key={i}
                style={[styles.chartBar, { height: `${h * 100}%`, opacity: 0.2 + h * 0.8 }]}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Med Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <Text style={styles.fieldLabel}>MEDICATION NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Aspirin"
              placeholderTextColor={C.outline}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.fieldLabel}>DOSAGE</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 81mg"
              placeholderTextColor={C.outline}
              value={dosage}
              onChangeText={setDosage}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },

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
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.onSurface, letterSpacing: -0.3 },

  heroCard: {
    borderRadius: 20, padding: 32, marginBottom: 16, overflow: 'hidden',
    backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  heroEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  heroCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 24 },
  heroCount: { fontSize: 56, fontWeight: '700', color: '#fff', letterSpacing: -2 },
  heroUnit: { fontSize: 22, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroPillName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  heroPillSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroRing: {
    position: 'absolute', right: -48, top: -48,
    width: 192, height: 192, borderRadius: 96,
    borderWidth: 16, borderColor: 'rgba(255,255,255,0.05)',
  },

  alertCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 20, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: C.primaryContainer + '30',
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  alertIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.primaryContainer + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  alertBody: { flex: 1, gap: 4 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.primary },
  alertTitle: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  alertText: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 20 },
  alertBold: { fontWeight: '700', color: C.onSurface },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: C.onSurface, letterSpacing: -0.3 },
  sectionSub: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  viewHistory: { fontSize: 13, fontWeight: '600', color: C.primary },

  medList: { gap: 12, marginBottom: 24 },
  medCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: C.surfaceContainerLow, borderRadius: 20, padding: 20,
  },
  medIconWrap: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: C.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  medInfo: { flex: 1 },
  medName: { fontSize: 17, fontWeight: '700', color: C.onSurface, marginBottom: 4 },
  medMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  medMetaText: { fontSize: 13, color: C.onSurfaceVariant },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.outlineVariant },

  complianceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.secondaryContainer, borderRadius: 20, padding: 24, marginBottom: 16,
  },
  complianceLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.onSecondaryContainer, marginBottom: 4 },
  complianceValue: { fontSize: 32, fontWeight: '900', color: C.onSurface },
  chartWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    height: 64, width: 128,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 10, padding: 8,
  },
  chartBar: {
    flex: 1, borderRadius: 4,
    backgroundColor: C.primaryContainer,
  },

  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 28,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: C.onSurface, marginBottom: 24 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: C.onSurfaceVariant, marginBottom: 8 },
  modalInput: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 15, color: C.onSurface, marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: 12,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  saveBtn: {
    flex: 1, height: 52, borderRadius: 12,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: C.onPrimaryContainer },
});
