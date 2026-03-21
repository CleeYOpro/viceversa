import React, { useMemo, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import {
  useVillageStore,
  MOCK_MEDS,
  HEALTH_HISTORY,
} from '../../stores/useVillageStore';
import { useRouter } from 'expo-router';
import {
  Brain, TrendingUp, Activity, AlertCircle,
  CheckCircle, Settings, Bell, MessageCircle,
} from 'lucide-react-native';
import { useFirestore } from '../../hooks/useFirestore';
import type { Medication, HealthLog } from '../../types';
import { buildAlertsFromUserData, MockAlert, UserContextJson } from '../../lib/alerts';
import C from '../../constants/colors';

export default function AlertsScreen() {
  const { lovedOne, activeVillageId, villages } = useVillageStore();
  const router = useRouter();
  const activeVillage = villages.find(v => v.id === activeVillageId);
  const { data: medications } = useFirestore<Medication>(
    activeVillageId ? `villages/${activeVillageId}/medications` : ''
  );
  const { data: logs } = useFirestore<HealthLog>(
    activeVillageId ? `villages/${activeVillageId}/logs` : ''
  );

  const userContext: UserContextJson = useMemo(() => {
    const patient = lovedOne ?? {
      name: 'Patient',
      dob: '',
      conditions: [],
      allergies: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
    };
    const firestoreMeds = medications ?? [];
    const firestoreLogs = logs ?? [];
    const rawMockMeds = activeVillageId ? MOCK_MEDS[activeVillageId] : null;
    const rawMockHistory = activeVillageId ? HEALTH_HISTORY[activeVillageId] : null;
    const mockMeds = Array.isArray(rawMockMeds) ? rawMockMeds : [];
    const mockHistory = Array.isArray(rawMockHistory) ? rawMockHistory : [];
    const meds = firestoreMeds.length > 0 ? firestoreMeds : (mockMeds.map(m => ({
      id: '', name: m.name, dosage: m.dose, frequency: 'daily' as const, scheduleTimes: [m.time], notes: m.taken ? 'Taken' : 'Pending',
    })) as Medication[]);
    const logList = firestoreLogs.length > 0 ? firestoreLogs : (mockHistory.map(h => ({
      id: '', type: 'note' as const, notes: `${h.date}: BP ${h.bp}, glucose ${h.glucose}, mood ${h.mood}. ${h.notes}`,
      timestamp: { toDate: () => new Date(h.date) } as any, authorId: '',
    })) as HealthLog[]);
    return {
      patient,
      village: { id: activeVillageId ?? '', name: activeVillage?.name ?? patient.name },
      medications: meds,
      logs: logList,
      healthHistory: mockHistory.map((h: { date: string; bp: string; glucose: number; mood: string; notes: string }) => ({ date: h.date, bp: h.bp, glucose: h.glucose, mood: h.mood, notes: h.notes })),
    };
  }, [lovedOne, activeVillageId, activeVillage?.name, medications, logs]);

  const [alerts, setAlerts] = useState<MockAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setAlertsLoading(true);
    buildAlertsFromUserData(userContext).then(a => {
      if (!cancelled) setAlerts(a);
    }).finally(() => { if (!cancelled) setAlertsLoading(false); });
    return () => { cancelled = true; };
  }, [userContext]);
  const aiAlerts = alerts.filter((a): a is MockAlert => a.type === 'ai_insight' || a.type === 'vitals_trend');
  const gridAlerts = alerts.filter((a): a is MockAlert => a.type === 'sensor' || a.type === 'medication');
  const resolvedAlerts = alerts.filter((a): a is MockAlert => a.type === 'resolved');

  const name = lovedOne?.name ?? 'Patient';

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]}</Text>
          </View>
          <Text style={styles.topBarName}>{name}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/chat')}>
          <MessageCircle size={22} color={C.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {alertsLoading && (
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>Loading AI alerts...</Text>
          </View>
        )}

        {/* Page heading */}
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>SYSTEM PULSE</Text>
          <View style={styles.pageHeaderRow}>
            <Text style={styles.pageTitle}>Smart Alerts</Text>
            <TouchableOpacity style={styles.thresholdBtn}>
              <Settings size={16} color={C.primary} />
              <Text style={styles.thresholdText}>Thresholds</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI / Vitals cards — from user JSON */}
        {aiAlerts.map((a) => (
          <View
            key={a.id}
            style={a.type === 'vitals_trend' ? styles.bpCard : styles.aiCard}
          >
            <View style={a.type === 'vitals_trend' ? styles.bpIconWrap : styles.aiIconWrap}>
              {a.type === 'vitals_trend' ? (
                <TrendingUp size={28} color={C.primaryContainer} />
              ) : (
                <Brain size={28} color={C.tertiary} />
              )}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={a.type === 'vitals_trend' ? styles.bpEyebrow : styles.aiEyebrow}>
                  {a.eyebrow}
                </Text>
                <Text style={styles.cardTime}>{a.timestamp}</Text>
              </View>
              <Text style={styles.cardTitle}>{a.title}</Text>
              {a.primaryAction && (
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>{a.primaryAction}</Text>
                </TouchableOpacity>
              )}
              {a.secondaryAction && (
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{a.secondaryAction}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* 2-col grid — sensor & medication alerts */}
        <View style={styles.grid}>
          {gridAlerts.map((a) => (
            <View key={a.id} style={styles.gridCard}>
              <View style={styles.gridCardHeader}>
                <View
                  style={[
                    styles.gridIconWrap,
                    a.type === 'medication' && { backgroundColor: C.errorContainer },
                  ]}
                >
                  {a.type === 'medication' ? (
                    <AlertCircle size={20} color={C.error} />
                  ) : (
                    <Activity size={20} color={C.onSurface} />
                  )}
                </View>
                <Text
                  style={[styles.gridEyebrow, a.type === 'medication' && { color: C.error }]}
                >
                  {a.eyebrow}
                </Text>
              </View>
              <Text style={styles.gridTitle}>{a.title}</Text>
              {a.primaryAction && (
                <View style={styles.gridBtns}>
                  <TouchableOpacity style={styles.gridBtnPrimary}>
                    <Text style={styles.gridBtnPrimaryText}>{a.primaryAction}</Text>
                  </TouchableOpacity>
                  {a.secondaryAction && (
                    <TouchableOpacity style={styles.gridBtnSecondary}>
                      <Text style={styles.gridBtnSecondaryText}>{a.secondaryAction}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {a.footer && (
                <View style={styles.gridFooter}>
                  <Text style={styles.gridFooterText}>{a.footer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Past 24h — resolved (from logs or mock) */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Past 24 Hours</Text>
            <Text style={styles.historyCount}>{resolvedAlerts.length} Resolved</Text>
          </View>
          {resolvedAlerts.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <CheckCircle size={20} color={C.secondary} />
                <Text style={styles.historyLabel}>{item.title}</Text>
              </View>
              <Text style={styles.historyTime}>{item.timestamp}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  topBarName: { fontSize: 22, fontWeight: '800', color: C.onSurface, letterSpacing: -0.3 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  pageHeader: { marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: C.primaryContainer, marginBottom: 4 },
  pageHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 32, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5 },
  thresholdBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: C.outlineVariant + '40',
  },
  thresholdText: { fontSize: 13, fontWeight: '600', color: C.onSurface },

  aiCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  aiIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.tertiaryContainer + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.tertiary },
  cardTime: { fontSize: 11, color: C.onSurfaceVariant },
  cardTitle: { fontSize: 17, fontWeight: '600', color: C.onSurface, lineHeight: 24 },
  secondaryBtn: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start',
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: C.onSurface },

  bpCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderLeftWidth: 4, borderLeftColor: C.primaryContainer,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  bpIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.primaryContainer + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  bpEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: C.primaryContainer },
  primaryBtn: {
    backgroundColor: C.primaryContainer, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, alignSelf: 'flex-start',
    shadowColor: C.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  grid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  gridCard: {
    flex: 1, backgroundColor: C.surfaceContainerLowest, borderRadius: 20, padding: 18,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 12,
  },
  gridCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gridIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  gridEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: C.onSurfaceVariant, flex: 1 },
  gridTitle: { fontSize: 14, fontWeight: '600', color: C.onSurface, lineHeight: 20 },
  gridBtns: { gap: 8 },
  gridBtnPrimary: {
    backgroundColor: C.primaryContainer, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  gridBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: C.onPrimaryContainer },
  gridBtnSecondary: {
    backgroundColor: C.surfaceContainerHigh, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  gridBtnSecondaryText: { fontSize: 12, fontWeight: '600', color: C.onSurface },
  gridFooter: { marginTop: 'auto' },
  gridFooterText: { fontSize: 11, color: C.onSurfaceVariant, fontStyle: 'italic' },

  historyCard: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 20, padding: 24, marginTop: 8,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  historyTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
  historyCount: { fontSize: 13, color: C.onSurfaceVariant },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 16, marginBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant + '30',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyLabel: { fontSize: 14, fontWeight: '500', color: C.onSurface },
  historyTime: { fontSize: 12, color: C.onSurfaceVariant },

  loadingRow: { paddingVertical: 16, alignItems: 'center' },
  loadingText: { fontSize: 14, color: C.onSurfaceVariant },
});
