import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { ChevronLeft, ChevronRight, Plus, Stethoscope, Footprints, Pill, MoreVertical } from 'lucide-react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/useAuthStore';
import C from '../../constants/colors';
import type { CalendarEvent } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

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

function eventDateKey(event: CalendarEvent): string {
  const ts = event.startDateTime as any;
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toISOString().split('T')[0];
}

function eventTime(event: CalendarEvent): string {
  const ts = event.startDateTime as any;
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function eventColor(type: string) {
  if (type === 'medication') return C.primaryContainer;
  if (type === 'appointment') return C.tertiaryContainer;
  return C.onSurfaceVariant;
}

function eventIcon(type: string): 'med' | 'doc' | 'walk' {
  if (type === 'medication') return 'med';
  if (type === 'appointment') return 'doc';
  return 'walk';
}

const today = new Date();

export default function CalendarScreen() {
  const { lovedOne, calendarEvents, loading, activePatientId } = useVillageStore();
  const { user } = useAuthStore();
  const [anchor, setAnchor] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const weekDays = getWeekDays(anchor);
  const month = MONTHS[anchor.getMonth()];
  const weekLabel = WEEK_LABELS[weekOfMonth(anchor)] ?? '4th';
  const year = anchor.getFullYear();

  // Build a map of date -> events from Firestore data
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of calendarEvents) {
      const key = eventDateKey(ev);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    // Sort each day's events by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const ta = (a.startDateTime as any)?.seconds ?? 0;
        const tb = (b.startDateTime as any)?.seconds ?? 0;
        return ta - tb;
      });
    }
    return map;
  }, [calendarEvents]);

  const events = eventsByDate[selectedDate] ?? [];
  const patientName = lovedOne?.name ?? 'Patient';

  const prevWeek = () => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); };
  const nextWeek = () => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patientName[0]}</Text>
          </View>
          <Text style={styles.topBarName}>{patientName}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip} contentContainerStyle={styles.weekStripContent}>
          {weekDays.map((d, i) => {
            const key = d.toISOString().split('T')[0];
            const isSelected = key === selectedDate;
            const isToday = key === today.toISOString().split('T')[0];
            const hasEvents = !!eventsByDate[key]?.length;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayItem, isSelected && styles.dayItemActive]}
                onPress={() => setSelectedDate(key)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{DAYS[d.getDay()]}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>
                  {d.getDate()}
                </Text>
                {hasEvents && <View style={[styles.eventDot, isSelected && styles.eventDotActive]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Schedule</Text>
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{events.length} EVENTS</Text>
          </View>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>No events scheduled</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {events.map((ev, i) => {
              const color = eventColor(ev.type);
              const icon = eventIcon(ev.type);
              const timeColor = ev.type === 'appointment' ? C.tertiary : ev.type === 'task' ? C.onSurfaceVariant : C.primary;
              return (
                <View key={ev.id ?? i} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: color }]} />
                    {i < events.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.eventCard}>
                    <View style={styles.eventCardTop}>
                      <Text style={[styles.eventTime, { color: timeColor }]}>{eventTime(ev)}</Text>
                      <TouchableOpacity><MoreVertical size={18} color={C.onSurfaceVariant} /></TouchableOpacity>
                    </View>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <View style={styles.eventSubRow}>
                      {icon === 'med' && <Pill size={14} color={C.onSurfaceVariant} />}
                      {icon === 'doc' && <Stethoscope size={14} color={C.onSurfaceVariant} />}
                      {icon === 'walk' && <Footprints size={14} color={C.onSurfaceVariant} />}
                      <Text style={styles.eventSub}>{ev.notes ?? ev.type}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      )}

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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  topBarName: { fontSize: 22, fontWeight: '800', color: C.primaryContainer, letterSpacing: -0.3 },

  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20,
  },
  monthTitle: { fontSize: 30, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5 },
  monthSub: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.surfaceContainerLow, alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: C.secondaryContainer, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
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
  timelineLine: { flex: 1, width: 2, backgroundColor: C.surfaceContainerHigh, marginTop: 4 },

  eventCard: {
    flex: 1, backgroundColor: C.surfaceContainerLowest,
    borderRadius: 20, padding: 20, marginBottom: 0,
    shadowColor: '#5a4136', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, gap: 6,
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
