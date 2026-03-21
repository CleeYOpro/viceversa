import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { seedDemoAuth } from '../lib/seedAuth';
import { seedDemoPatients } from '../lib/seedFirestore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import C from '../constants/colors';

export default function RootLayout() {
  const { user, loading, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const unsub = init();
    seedDemoAuth();
    return unsub;
  }, []);

  // Seed Firestore data once user is authenticated
  useEffect(() => {
    if (user) {
      seedDemoPatients().catch(console.error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      if (!navigationRef.isReady()) { requestAnimationFrame(run); return; }

      const inAuth = segments[0] === 'auth';

      if (!user && !inAuth) {
        router.replace('/auth/sign-in');
      } else if (user && inAuth) {
        // Skip onboarding — go straight to dashboard
        router.replace('/(tabs)');
      }
    };

    run();
    return () => { cancelled = true; };
  }, [user, loading, segments, navigationRef, router]);

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/step1" />
        <Stack.Screen name="onboarding/step2" />
        <Stack.Screen name="onboarding/step3" />
        <Stack.Screen name="patient-edit" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="village/[villageId]/index" />
        <Stack.Screen name="village/[villageId]/members" />
        <Stack.Screen name="village/[villageId]/insights" />
        <Stack.Screen name="village/[villageId]/help" />
      </Stack>
      {loading && (
        <View style={styles.overlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={C.primaryContainer} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.surface,
  },
});
