import React from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useFirestore } from '../../hooks/useFirestore';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Task, HealthLog, AIInsight } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import { Bell, Heart, Droplets, CheckCircle, Clock, MapPin, PenLine, ListChecks, TrendingUp, AlertTriangle } from 'lucide-react-native';
import C from '../../constants/colors';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { villages, activeVillageId } = useVillageStore();

  const activeVillage = villages.find(v => v.id === activeVillageId);
  const lovedOneName = activeVillage?.name ?? 'Margaret';

  const { data: tasks, loading: tasksLoading } = useFirestore<Task>(
    activeVillageId ? `villages/${activeVillageId}/tasks` : ''
  );
  const { data: insights } = useFirestore<AIInsight>(
    activeVillageId ? `villages/${activeVillageId}/insights` : ''
  );

  if (!activeVillageId) return <SkeletonLoader />;

  const todayTasks = tasks.slice(0, 3);
  // Show urgent alert when there are recent insights (demo: always show for now)
  const showUrgentAlert = insights.length > 0;

  return (
    <View style={styles.screen}>
      <OfflineBanner />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{lovedOneName[0]}</Text>
          </View>
          <Text style={styles.topBarName}>{lovedOneName}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={22} color={C.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Urgent Alert */}
        {showUrgentAlert && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={28} color="#fff" fill="#fff" />
              <Text style={styles.alertTitle}>Confusion event detected</Text>
            </View>
            <Text style={styles.alertBody}>
              AI monitoring noted unusual cognitive patterns in the last 15 minutes. Immediate check-in recommended.
            </Text>
            <TouchableOpacity style={styles.alertBtn}>
              <Text style={styles.alertBtnText}>Respond Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Real-time Vitals */}
        <Text style={styles.sectionLabel}>REAL-TIME VITALS</Text>
        <View style={styles.vitalsRow}>
          <View style={styles.vitalCard}>
            <View style={styles.vitalCardTop}>
              <Heart size={22} color={C.primary} />
              <View style={[styles.badge, { backgroundColor: C.primaryContainer + '18' }]}>
                <Text style={[styles.badgeText, { color: C.primary }]}>STABLE</Text>
              </View>
            </View>
            <Text style={styles.vitalValue}>132/84</Text>
            <Text style={styles.vitalLabel}>BLOOD PRESSURE <Text style={styles.vitalUnit}>mmHg</Text></Text>
          </View>
          <View style={styles.vitalCard}>
            <View style={styles.vitalCardTop}>
              <Droplets size={22} color={C.tertiary} />
              <View style={[styles.badge, { backgroundColor: C.tertiaryContainer + '18' }]}>
                <Text style={[styles.badgeText, { color: C.tertiary }]}>OPTIMAL</Text>
              </View>
            </View>
            <Text style={styles.vitalValue}>110</Text>
            <Text style={styles.vitalLabel}>GLUCOSE <Text style={styles.vitalUnit}>mg/dL</Text></Text>
          </View>
        </View>

        {/* Today's Care */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>TODAY'S CARE</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {tasksLoading ? (
          <SkeletonLoader />
        ) : (
          <View style={styles.taskList}>
            {/* Static demo tasks matching the design */}
            <TaskRow
              title="Lisinopril"
              subtitle="Daily Dosage • 8:00 AM"
              done
              icon={<CheckCircle size={18} color={C.primaryContainer} fill={C.primaryContainer} />}
              badge="DONE"
            />
            <TaskRow
              title="Metformin"
              subtitle="Post Lunch • 2:00 PM"
              highlighted
              icon={<View style={styles.emptyCheck} />}
              trailingIcon={<Clock size={20} color={C.onSurfaceVariant} />}
            />
            <TaskRow
              title="Doctor's Visit"
              subtitle="General Checkup • 4:00 PM"
              icon={<View style={styles.emptyCheck} />}
              trailingIcon={<MapPin size={20} color={C.onSurfaceVariant} />}
            />
          </View>
        )}

        {/* Management */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>MANAGEMENT</Text>
        <View style={styles.actionGrid}>
          <ActionButton
            icon={<PenLine size={22} color={C.primary} />}
            label="LOG EVENT"
            iconBg={C.primaryContainer + '18'}
          />
          <ActionButton
            icon={<ListChecks size={22} color={C.tertiary} />}
            label="NEW TASK"
            iconBg={C.tertiaryContainer + '18'}
          />
          <ActionButton
            icon={<TrendingUp size={22} color={C.onSurfaceVariant} />}
            label="VIEW TRENDS"
            iconBg={C.onSurfaceVariant + '18'}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function TaskRow({
  title, subtitle, done, highlighted, icon, badge, trailingIcon,
}: {
  title: string; subtitle: string; done?: boolean; highlighted?: boolean;
  icon: React.ReactNode; badge?: string; trailingIcon?: React.ReactNode;
}) {
  return (
    <View style={[styles.taskRow, highlighted && styles.taskRowHighlighted]}>
      <View style={styles.taskCheck}>{icon}</View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.taskSub}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>{badge}</Text>
        </View>
      )}
      {trailingIcon}
    </View>
  );
}

function ActionButton({ icon, label, iconBg }: { icon: React.ReactNode; label: string; iconBg: string }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
    backgroundColor: C.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  topBarName: { fontSize: 24, fontWeight: '800', color: C.primary, letterSpacing: -0.5 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  alertCard: {
    borderRadius: 16, padding: 24, marginBottom: 24,
    backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  alertTitle: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1 },
  alertBody: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 16 },
  alertBtn: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  alertBtnText: { fontSize: 15, fontWeight: '700', color: C.primary },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    color: C.onSurfaceVariant, marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  viewAll: { fontSize: 12, fontWeight: '600', color: C.primary },

  vitalsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  vitalCard: {
    flex: 1, backgroundColor: C.surfaceContainerLow,
    borderRadius: 20, padding: 20, height: 160,
    justifyContent: 'space-between',
  },
  vitalCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  vitalValue: { fontSize: 30, fontWeight: '700', color: C.onSurface, letterSpacing: -0.5 },
  vitalLabel: { fontSize: 10, fontWeight: '600', color: C.onSurfaceVariant, letterSpacing: 0.5 },
  vitalUnit: { fontSize: 9 },

  taskList: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 20, overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18, gap: 16,
  },
  taskRowHighlighted: {
    backgroundColor: C.surfaceContainerLowest,
    marginHorizontal: 8, marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  taskCheck: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  emptyCheck: {
    width: 24, height: 24, borderRadius: 8,
    borderWidth: 2, borderColor: C.outlineVariant,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: C.onSurface, marginBottom: 2 },
  taskSub: { fontSize: 12, color: C.onSurfaceVariant },
  doneBadge: {
    backgroundColor: C.secondaryContainer,
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4,
  },
  doneBadgeText: { fontSize: 9, fontWeight: '700', color: C.onSecondaryContainer, letterSpacing: 0.5 },

  actionGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, aspectRatio: 1,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel: { fontSize: 9, fontWeight: '700', color: C.onSurface, letterSpacing: 0.5 },
});
