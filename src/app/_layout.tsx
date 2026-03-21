import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useVillageStore } from '../stores/useVillageStore';
import { requestPermissions, registerToken } from '../lib/notifications';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { user, loading } = useAuthStore();
  const { villages, activeVillageId } = useVillageStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

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
  }, [user, loading, segments, villages, activeVillageId]);

  useEffect(() => {
    if (user) {
      requestPermissions().then((granted) => {
        if (granted) registerToken(user.uid);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0B6E4F" />
      </View>
    );
  }

  return (
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
  );
}
