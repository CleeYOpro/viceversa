import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, CheckCircle } from 'lucide-react-native';
import C from '../../constants/colors';

export default function OnboardingStep3() {
  const router = useRouter();
  const { villageId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    // Small delay for UX feel, then go to app
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerIcon}>✚</Text>
          <Text style={styles.headerTitle}>High-Performance Care</Text>
        </View>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
          <Text style={styles.progressLabel}>STEP 3 OF 3</Text>
        </View>

        {/* Confirmation */}
        <View style={styles.centerContent}>
          <View style={styles.checkWrap}>
            <CheckCircle size={64} color={C.primaryContainer} />
          </View>
          <Text style={styles.heading}>You're all set</Text>
          <Text style={styles.subheading}>
            Your care profile is ready. You can always update settings and invite more team members later.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.ctaBtnText}>Go to Dashboard</Text>
                <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
          }
        </TouchableOpacity>

        <Text style={styles.termsNote}>By completing setup, you agree to our Terms of Service.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: C.surface,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { fontSize: 18, color: C.primaryContainer },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.primary },
  headerDivider: { height: 1, backgroundColor: C.surfaceContainerHigh, opacity: 0.3 },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, justifyContent: 'space-between' },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  progressBar: { width: 48, height: 6, borderRadius: 3, backgroundColor: C.primaryContainer },
  progressLabel: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, opacity: 0.6 },

  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 16 },
  checkWrap: { marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5, textAlign: 'center' },
  subheading: { fontSize: 15, color: C.onSurfaceVariant, textAlign: 'center', lineHeight: 24 },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16,
    backgroundColor: C.primaryContainer,
    marginBottom: 16,
    shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 16, elevation: 4,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  termsNote: { textAlign: 'center', fontSize: 12, color: C.onSurfaceVariant, opacity: 0.6 },
});
