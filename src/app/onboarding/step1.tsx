import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { useVillageStore } from '../../stores/useVillageStore';
import { db } from '../../lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export default function OnboardingStep1() {
  const [villageName, setVillageName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { setActiveVillage } = useVillageStore();

  const handleCreate = async () => {
    if (!villageName.trim() || !user) return;
    setLoading(true);
    
    try {
      const villageId = `village_${Date.now()}`;
      // mock encoding
      const inviteCode = btoa(villageId + "_encode").substring(0, 8).toUpperCase(); 

      // Create village
      await setDoc(doc(db, 'villages', villageId), {
        id: villageId,
        name: villageName,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        inviteCode,
      });

      // Add creator as member
      await setDoc(doc(db, 'villages', villageId, 'members', user.uid), {
        userId: user.uid,
        role: 'admin',
        joinedAt: Timestamp.now(),
        displayName: user.email?.split('@')[0] || 'Admin',
      });

      // Update user villages array
      await setDoc(doc(db, 'users', user.uid), {
        villageIds: [villageId],
        email: user.email,
        expoPushToken: ''
      }, { merge: true });

      setActiveVillage(villageId);
      router.push(`/onboarding/step2?villageId=${villageId}&inviteCode=${inviteCode}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-12 justify-center">
      <Text className="text-[32px] font-bold text-gray-900 mb-2">Create Your Village</Text>
      <Text className="text-[18px] text-gray-600 mb-8">
        A Village is your private space to coordinate care with family and professionals.
      </Text>

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Village Name</Text>
      <TextInput
        className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-6 min-h-[44px]"
        placeholder="e.g., Mom's Care Team"
        value={villageName}
        onChangeText={setVillageName}
      />

      <TouchableOpacity
        className="bg-[#0B6E4F] rounded-xl p-4 items-center justify-center min-h-[56px]"
        onPress={handleCreate}
        disabled={loading || !villageName.trim()}
      >
        <Text className="text-white text-[20px] font-bold">
          {loading ? 'Creating...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
