import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useRouter } from 'expo-router';
import {
  Brain, TrendingUp, Activity, AlertCircle,
  CheckCircle, Settings, Bell, MessageCircle,
} from 'lucide-react-native';
import C from '../../constants/colors';

export default function AlertsScreen() {
  const { lovedOne } = useVillageStore();
  const router = useRouter();
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

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <View style={styles.aiIconWrap}>
            <Brain size={28} color={C.tertiary} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={styles.aiEyebrow}>AI INTELLIGENCE</Text>
              <Text style={styles.cardTime}>Today, 4:12 PM</Text>
            </View>
            <Text style={styles.cardTitle}>Confusion events cluster between 4–6pm</Text>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Log Observation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BP Trend */}
        <View style={styles.bpCard}>
          <View style={styles.bpIconWrap}>
            <TrendingUp size={28} color={C.primaryContainer} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={styles.bpEyebrow}>VITALS TREND</Text>
              <Text style={styles.cardTime}>3 days ago</Text>
            </View>
            <Text style={styles.cardTitle}>BP high 3 days in a row</Text>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Notify Doctor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2-col grid */}
        <View style={styles.grid}>
          {/* Sensor */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardHeader}>
              <View style={styles.gridIconWrap}>
                <Activity size={20} color={C.onSurface} />
              </View>
              <Text style={styles.gridEyebrow}>SENSOR ALERT</Text>
            </View>
            <Text style={styles.gridTitle}>No activity logged for 8 hours</Text>
            <View style={styles.gridBtns}>
              <TouchableOpacity style={styles.gridBtnPrimary}>
                <Text style={styles.gridBtnPrimaryText}>Ping Caregiver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gridBtnSecondary}>
                <Text style={styles.gridBtnSecondaryText}>I'm checking</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Medication */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardHeader}>
              <View style={[styles.gridIconWrap, { backgroundColor: C.errorContainer }]}>
                <AlertCircle size={20} color={C.error} />
              </View>
              <Text style={[styles.gridEyebrow, { color: C.error }]}>URGENT MEDICATION</Text>
            </View>
            <Text style={styles.gridTitle}>Missed evening dose detected</Text>
            <View style={styles.gridFooter}>
              <Text style={styles.gridFooterText}>Protocol: Remind via Voice Hub</Text>
            </View>
          </View>
        </View>

        {/* Past 24h */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Past 24 Hours</Text>
            <Text style={styles.historyCount}>12 Resolved</Text>
          </View>
          {[
            { label: 'Hydration Goal Met', time: '11:00 AM' },
            { label: 'Morning Meds Confirmed', time: '08:15 AM' },
          ].map((item, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <CheckCircle size={20} color={C.secondary} />
                <Text style={styles.historyLabel}>{item.label}</Text>
              </View>
              <Text style={styles.historyTime}>{item.time}</Text>
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
});
