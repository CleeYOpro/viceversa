import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Pressable,
} from 'react-native';
import { Bell, MessageCircle, UserCog, RefreshCw, X } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useVillageStore } from '../../stores/useVillageStore';
import { useRouter } from 'expo-router';
import C from '../../constants/colors';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { villages, activeVillageId, lovedOne, setActiveVillage } = useVillageStore();
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const activeVillage = villages.find(v => v.id === activeVillageId);
  const patientName = lovedOne?.name ?? activeVillage?.name ?? 'Patient';

  return (
    <View style={styles.screen}>
      {/* Top App Bar */}
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
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color={C.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty state */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyIcon}>🏥</Text>
          </View>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Your care dashboard will populate once you start logging health events and tasks.
          </Text>
        </View>
      </ScrollView>

      {/* Patient Switcher Bottom Sheet */}
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

          {/* Patient list */}
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

          {/* Actions */}
          <TouchableOpacity
            style={styles.sheetAction}
            onPress={() => { setSheetVisible(false); router.push('/patient-edit'); }}
          >
            <View style={styles.sheetActionIcon}>
              <UserCog size={20} color={C.primary} />
            </View>
            <Text style={styles.sheetActionText}>Edit Patient Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetAction}
            onPress={() => {
              const other = villages.find(v => v.id !== activeVillageId);
              if (other) { setActiveVillage(other.id); }
              setSheetVisible(false);
            }}
          >
            <View style={styles.sheetActionIcon}>
              <RefreshCw size={20} color={C.tertiary} />
            </View>
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
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, backgroundColor: C.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.onPrimaryContainer },
  topBarName: { fontSize: 22, fontWeight: '800', color: C.primary, letterSpacing: -0.5 },
  topBarSub: { fontSize: 11, color: C.onSurfaceVariant, marginTop: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  emptyState: { alignItems: 'center', gap: 16 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: C.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  emptySubtitle: { fontSize: 14, color: C.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },

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
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 16, marginBottom: 8,
  },
  patientRowActive: { backgroundColor: C.surfaceContainerLow },
  patientAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarActive: { backgroundColor: C.primaryContainer },
  patientAvatarText: { fontSize: 18, fontWeight: '700', color: C.onSurface },
  patientAvatarTextActive: { color: C.onPrimaryContainer },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  patientRole: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 2 },
  activeDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.primaryContainer,
  },

  sheetDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, marginVertical: 12 },
  sheetAction: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 4,
  },
  sheetActionIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetActionText: { fontSize: 15, fontWeight: '600', color: C.onSurface },
});
