import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useVillageStore } from '../stores/useVillageStore';
import { requestPermissions, registerToken } from '../lib/notifications';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { user, loading } = useAuthStore();
  const { villages, activeVillageId } = useVillageStore();
  const segments = useSegments();
  const router = useRouter();
  /** Must match expo-router's internal check in assertIsReady() — not useRootNavigationState()?.key */
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    const runWhenNavigationReady = () => {
      if (cancelled) return;
      if (!navigationRef.isReady()) {
        requestAnimationFrame(runWhenNavigationReady);
        return;
      }

      const inAuthGroup = segments[0] === 'auth';

      if (!user && !inAuthGroup) {
        router.replace('/auth/sign-in');
      } else if (user && inAuthGroup) {
        if (villages.length === 0 && !activeVillageId) {
          router.replace('/onboarding/step1');
        } else {
          router.replace('/(tabs)');
        }
      }
    };

    runWhenNavigationReady();

    return () => {
      cancelled = true;
    };
  }, [user, loading, segments, villages, activeVillageId, navigationRef, router]);

  useEffect(() => {
    if (user) {
      requestPermissions().then((granted) => {
        if (granted) registerToken(user.uid);
      });
    }
  }, [user]);

  // Root layout must always mount a navigator (Stack). Returning only a spinner breaks expo-router.
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/step1" />
        <Stack.Screen name="onboarding/step2" />
        <Stack.Screen name="onboarding/step3" />
        <Stack.Screen name="village/[villageId]/index" />
        <Stack.Screen name="village/[villageId]/members" />
        <Stack.Screen name="village/[villageId]/insights" />
        <Stack.Screen name="village/[villageId]/help" />
      </Stack>
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#0B6E4F" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
