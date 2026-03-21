import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import {
  MessageCircle, UserCog, RefreshCw, X,
  Heart, Droplets, Thermometer, Wind,
  Pill, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Plus, Brain,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useVillageStore } from '../../stores/useVillageStore';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import C from '../../constants/colors';
import type { Task, HealthLog } from '../../types';

function getLatestVitals(logs: HealthLog[]) {
  const bpLog = logs.find(l => l.vitals?.bp);
  const glucoseLog = logs.find(l => l.vitals?.glucose);
  return {
    bp: bpLog?.vitals?.bp ?? '—',
    glucose: glucoseLog?.vitals?.glucose?.toString() ?? '—',
  };
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { villages, activePatientId, activeVillageId, lovedOne, patient,
          tasks, healthLogs, insights, loading, setActiveVillage } = useVillageStore();
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const patientName = lovedOne?.name ?? patient?.name ?? 'Patient';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const vitals = getLatestVitals(healthLogs);
  const todayTasks = tasks.slice(0, 5);
  const doneTasks = todayTasks.filter(t => t.status === 'completed').length;
  const topInsight = insights[0];

  const VITALS_DISPLAY = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: '#e53935', bg: '#fdecea' },
    { label: 'Blood Pressure', value: vitals.bp, unit: 'mmHg', icon: Droplets, color: C.tertiary, bg: '#e3f2fd' },
    { label: 'Temperature', value: '98.4', unit: '°F', icon: Thermometer, color: '#f57c00', bg: '#fff3e0' },
    { label: 'SpO2', value: '97', unit: '%', icon: Wind, color: '#2e7d32', bg: '#e8f5e9' },
  ];

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'patients', activePatientId, 'tasks', task.id), { status: newStatus });
      // Optimistic update via reload
      useVillageStore.getState().loadPatientData(activePatientId);
    } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.avatar} onPress={() => setSheetVisible(true)}>
            <Text style={styles.avatarText}>{patientName[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.topBarName}>{patientName}</Text>
            <Text style={styles.topBarSub}>Tap to switch patient</Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/chat')}>
            <MessageCircle size={22} color={C.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting}, {user?.displayName ?? 'Caregiver'}</Text>
        <Text style={styles.greetingSub}>Here's {patientName}'s care summary for today</Text>

        {topInsight && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(tabs)/village')}>
            <View style={styles.alertBannerIcon}><Brain size={18} color={C.primary} /></View>
            <Text style={styles.alertBannerText} numberOfLines={2}>{topInsight.summary}</Text>
            <ChevronRight size={16} color={C.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Vitals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/log')}>
            <Text style={styles.sectionLink}>Log vitals</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.vitalsGrid}>
          {VITALS_DISPLAY.map((v) => (
            <View key={v.label} style={[styles.vitalCard, { backgroundColor: v.bg }]}>
              <v.icon size={18} color={v.color} />
              <Text style={[styles.vitalValue, { color: v.color }]}>{v.value}</Text>
              <Text style={styles.vitalUnit}>{v.unit}</Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={styles.taskProgress}>
            <Text style={styles.taskProgressText}>{doneTasks}/{todayTasks.length}</Text>
          </View>
        </View>
        <View style={styles.taskList}>
          {todayTasks.map((task) => {
            const done = task.status === 'completed';
            const urgent = task.category === 'medication';
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskRow, done && styles.taskRowDone]}
                onPress={() => toggleTask(task)}
              >
                <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                  {done && <CheckCircle2 size={20} color={C.primaryContainer} />}
                  {!done && urgent && <AlertTriangle size={16} color={C.error} />}
                  {!done && !urgent && <Clock size={16} color={C.onSurfaceVariant} />}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>{task.title}</Text>
                  <Text style={styles.taskTime}>{task.assigneeName ?? ''}</Text>
                </View>
                {urgent && !done && (
                  <View style={styles.urgentBadge}><Text style={styles.urgentText}>URGENT</Text></View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Quick Actions</Text></View>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/log')}>
            <View style={[styles.quickIcon, { backgroundColor: '#fdecea' }]}><Heart size={22} color="#e53935" /></View>
            <Text style={styles.quickLabel}>Log Vitals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/meds')}>
            <View style={[styles.quickIcon, { backgroundColor: '#fff3e0' }]}><Pill size={22} color="#f57c00" /></View>
            <Text style={styles.quickLabel}>Medications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/chat')}>
            <View style={[styles.quickIcon, { backgroundColor: '#f3e5f5' }]}><Brain size={22} color="#7b1fa2" /></View>
            <Text style={styles.quickLabel}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/calendar')}>
            <View style={[styles.quickIcon, { backgroundColor: '#e8f5e9' }]}><Plus size={22} color="#2e7d32" /></View>
            <Text style={styles.quickLabel}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {lovedOne?.conditions && lovedOne.conditions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Conditions</Text>
              <TouchableOpacity onPress={() => router.push('/patient-edit')}>
                <Text style={styles.sectionLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.conditionChips}>
              {lovedOne.conditions.map(c => (
                <View key={c} style={styles.conditionChip}>
                  <Text style={styles.conditionChipText}>{c}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      )}

      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Patients</Text>
            <TouchableOpacity onPress={() => setSheetVisible(false)}>
              <X size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          {villages.map(v => {
            const isActive = v.id === activeVillageId;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.patientRow, isActive && styles.patientRowActive]}
                onPress={() => { setActiveVillage(v.id); setSheetVisible(false); }}
              >
                <View style={[styles.patientAvatar, isActive && styles.patientAvatarActive]}>
                  <Text style={[styles.patientAvatarText, isActive && styles.patientAvatarTextActive]}>
                    {v.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{v.name}</Text>
                  <Text style={styles.patientRole}>{isActive ? 'Currently viewing' : 'Tap to switch'}</Text>
                </View>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
          <View style={styles.sheetDivider} />
          <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetVisible(false); router.push('/patient-edit'); }}>
            <View style={styles.sheetActionIcon}><UserCog size={20} color={C.primary} /></View>
            <Text style={styles.sheetActionText}>Edit Patient Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetAction} onPress={() => {
            const other = villages.find(v => v.id !== activeVillageId);
            if (other) setActiveVillage(other.id);
            setSheetVisible(false);
          }}>
            <View style={styles.sheetActionIcon}><RefreshCw size={20} color={C.tertiary} /></View>
            <Text style={styles.sheetActionText}>Switch Patient</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.onPrimaryContainer },
  topBarName: { fontSize: 20, fontWeight: '800', color: C.primary, letterSpacing: -0.3 },
  topBarSub: { fontSize: 11, color: C.onSurfaceVariant, marginTop: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  greeting: { fontSize: 24, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, marginBottom: 4 },
  greetingSub: { fontSize: 14, color: C.onSurfaceVariant, marginBottom: 20 },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff8f0', borderRadius: 16, padding: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#ffe0c2',
  },
  alertBannerIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#fff0e0', alignItems: 'center', justifyContent: 'center',
  },
  alertBannerText: { flex: 1, fontSize: 13, color: C.onSurface, fontWeight: '500', lineHeight: 18 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
  sectionLink: { fontSize: 13, color: C.primary, fontWeight: '600' },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  vitalCard: { width: '47%', borderRadius: 18, padding: 16, gap: 4 },
  vitalValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginTop: 6 },
  vitalUnit: { fontSize: 11, fontWeight: '600', color: C.onSurfaceVariant },
  vitalLabel: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 },

  taskList: { gap: 8, marginBottom: 28 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 14,
    shadowColor: '#5a4136', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  taskRowDone: { opacity: 0.55 },
  taskCheck: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.surfaceContainerLow, alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone: { backgroundColor: '#e8f5e9' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: C.onSurface },
  taskTitleDone: { textDecorationLine: 'line-through', color: C.onSurfaceVariant },
  taskTime: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 },
  urgentBadge: { backgroundColor: '#fdecea', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 9, fontWeight: '800', color: C.error, letterSpacing: 0.5 },
  taskProgress: { backgroundColor: C.primaryContainer, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  taskProgressText: { fontSize: 11, fontWeight: '700', color: C.onPrimaryContainer },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  quickBtn: { alignItems: 'center', gap: 8, flex: 1 },
  quickIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', color: C.onSurface, textAlign: 'center' },

  conditionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  conditionChip: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.outlineVariant,
  },
  conditionChipText: { fontSize: 13, color: C.onSurface, fontWeight: '500' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 24, elevation: 16,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.surfaceContainerHigh, alignSelf: 'center', marginBottom: 20,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  patientRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 8,
  },
  patientRowActive: { backgroundColor: C.surfaceContainerLow },
  patientAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarActive: { backgroundColor: C.primaryContainer },
  patientAvatarText: { fontSize: 18, fontWeight: '700', color: C.onSurface },
  patientAvatarTextActive: { color: C.onPrimaryContainer },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  patientRole: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primaryContainer },
  sheetDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, marginVertical: 12 },
  sheetAction: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 4,
  },
  sheetActionIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surfaceContainerLow, alignItems: 'center', justifyContent: 'center',
  },
  sheetActionText: { fontSize: 15, fontWeight: '600', color: C.onSurface },
});
