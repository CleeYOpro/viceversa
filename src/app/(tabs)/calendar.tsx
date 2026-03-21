import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { ChevronLeft, ChevronRight, Plus, Stethoscope, Footprints, Pill, MoreVertical } from 'lucide-react-native';
import C from '../../constants/colors';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

// Demo schedule events
const DEMO_EVENTS: Record<string, { time: string; title: string; sub: string; color: string; icon: 'med' | 'doc' | 'walk' }[]> = {};

function seedEvents(baseDate: Date) {
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const today = fmt(baseDate);
  const tomorrow = fmt(new Date(baseDate.getTime() + 86400000));
  const yesterday = fmt(new Date(baseDate.getTime() - 86400000));

  DEMO_EVENTS[today] = [
    { time: '8:00 AM', title: 'Medication', sub: 'Daily Meds', color: C.primaryContainer, icon: 'med' },
    { time: '2:00 PM', title: 'Doctor Appointment', sub: 'Therapy Session at St. Jude', color: C.tertiaryContainer, icon: 'doc' },
    { time: '4:30 PM', title: 'Light Exercise Walk', sub: '15 min duration', color: C.onSurfaceVariant, icon: 'walk' },
  ];
  DEMO_EVENTS[tomorrow] = [
    { time: '9:00 AM', title: 'Medication', sub: 'Morning Meds', color: C.primaryContainer, icon: 'med' },
  ];
  DEMO_EVENTS[yesterday] = [
    { time: '10:00 AM', title: 'Blood Pressure Check', sub: 'Home monitoring', color: C.tertiaryContainer, icon: 'doc' },
  ];
}

const today = new Date();
seedEvents(today);

function getWeekDays(anchor: Date) {
  const day = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - day + (day === 0 ? -6 : 1));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function weekOfMonth(d: Date) {
  return Math.ceil(d.getDate() / 7) - 1;
}

export default function CalendarScreen() {
  const { lovedOne } = useVillageStore();
  const [anchor, setAnchor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const weekDays = getWeekDays(anchor);
  const month = MONTHS[anchor.getMonth()];
  const weekLabel = WEEK_LABELS[weekOfMonth(anchor)] ?? '4th';
  const year = anchor.getFullYear();

  const prevWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  };

  const events = DEMO_EVENTS[selectedDate] ?? [];
  const patientName = lovedOne?.name ?? 'Patient';

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patientName[0]}</Text>
          </View>
          <Text style={styles.topBarName}>{patientName}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Month + week nav */}
        <View style={styles.monthRow}>
          <View>
            <Text style={styles.monthTitle}>{month}</Text>
            <Text style={styles.monthSub}>{weekLabel} Week • {year}</Text>
          </View>
          <View style={styles.navBtns}>
            <TouchableOpacity style={styles.navBtn} onPress={prevWeek}>
              <ChevronLeft size={18} color={C.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={nextWeek}>
              <ChevronRight size={18} color={C.onSurface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip} contentContainerStyle={styles.weekStripContent}>
          {weekDays.map((d, i) => {
            const key = d.toISOString().split('T')[0];
            const isSelected = key === selectedDate;
            const isToday = key === today.toISOString().split('T')[0];
            const hasEvents = !!DEMO_EVENTS[key]?.length;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayItem, isSelected && styles.dayItemActive]}
                onPress={() => setSelectedDate(key)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
                  {DAYS[d.getDay()]}
                </Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>
                  {d.getDate()}
                </Text>
                {hasEvents && <View style={[styles.eventDot, isSelected && styles.eventDotActive]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schedule */}
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{events.length} TASKS</Text>
          </View>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>No events scheduled</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {events.map((ev, i) => (
              <View key={i} style={styles.timelineItem}>
                {/* Line + dot */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: ev.color }]} />
                  {i < events.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Card */}
                <View style={styles.eventCard}>
                  <View style={styles.eventCardTop}>
                    <Text style={[styles.eventTime, { color: ev.color === C.tertiaryContainer ? C.tertiary : ev.color === C.onSurfaceVariant ? C.onSurfaceVariant : C.primary }]}>
                      {ev.time}
                    </Text>
                    <TouchableOpacity>
                      <MoreVertical size={18} color={C.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <View style={styles.eventSubRow}>
                    {ev.icon === 'med' && <Pill size={14} color={C.onSurfaceVariant} />}
                    {ev.icon === 'doc' && <Stethoscope size={14} color={C.onSurfaceVariant} />}
                    {ev.icon === 'walk' && <Footprints size={14} color={C.onSurfaceVariant} />}
                    <Text style={styles.eventSub}>{ev.sub}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={28} color={C.onPrimaryContainer} />
      </TouchableOpacity>
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
  topBarName: { fontSize: 22, fontWeight: '800', color: C.primaryContainer, letterSpacing: -0.3 },

  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 20,
  },
  monthTitle: { fontSize: 30, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5 },
  monthSub: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },

  weekStrip: { marginBottom: 32 },
  weekStripContent: { gap: 8, paddingRight: 8 },
  dayItem: {
    alignItems: 'center', gap: 8, minWidth: 54,
    paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 18, backgroundColor: C.surfaceContainerLow,
  },
  dayItemActive: {
    backgroundColor: C.primaryContainer,
    shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  dayLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: C.onSurfaceVariant },
  dayLabelActive: { color: C.onPrimaryContainer },
  dayNum: { fontSize: 18, fontWeight: '700', color: C.onSurface },
  dayNumActive: { color: C.onPrimaryContainer },
  dayNumToday: { color: C.primaryContainer },
  eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primaryContainer },
  eventDotActive: { backgroundColor: C.onPrimaryContainer },

  scheduleHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
  },
  scheduleTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  taskCountBadge: {
    backgroundColor: C.secondaryContainer, borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  taskCountText: { fontSize: 10, fontWeight: '700', color: C.onSecondaryContainer, letterSpacing: 0.5 },

  emptyDay: { alignItems: 'center', paddingVertical: 48 },
  emptyDayText: { fontSize: 15, color: C.onSurfaceVariant },

  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 4, borderColor: C.surface, zIndex: 1,
  },
  timelineLine: {
    flex: 1, width: 2,
    backgroundColor: C.surfaceContainerHigh,
    marginTop: 4,
  },

  eventCard: {
    flex: 1, backgroundColor: C.surfaceContainerLowest,
    borderRadius: 20, padding: 20, marginBottom: 0,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
    gap: 6,
  },
  eventCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTime: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  eventTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
  eventSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventSub: { fontSize: 13, color: C.onSurfaceVariant },

  fab: {
    position: 'absolute', bottom: 100, right: 24,
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
});
