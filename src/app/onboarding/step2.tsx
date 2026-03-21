import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OnboardingStep2() {
  const router = useRouter();
  const { villageId, inviteCode } = useLocalSearchParams();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my CareSync Village! Use invite code: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-12 justify-center">
      <Text className="text-[32px] font-bold text-gray-900 mb-2">Invite Members</Text>
      <Text className="text-[18px] text-gray-600 mb-8">
        Share this code with family members or caregivers so they can join your Village.
      </Text>

      <View className="bg-blue-50 border border-blue-200 p-6 rounded-xl items-center mb-8">
        <Text className="text-[16px] text-blue-800 uppercase tracking-widest mb-2">Invite Code</Text>
        <Text className="text-[40px] font-black text-blue-900 tracking-widest">{inviteCode}</Text>
      </View>

      <TouchableOpacity
        className="bg-[#2589BD] rounded-xl p-4 items-center justify-center min-h-[56px] mb-4"
        onPress={handleShare}
      >
        <Text className="text-white text-[20px] font-bold">Share Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-100 rounded-xl p-4 items-center justify-center min-h-[56px]"
        onPress={() => router.push(`/onboarding/step3?villageId=${villageId}`)}
      >
        <Text className="text-gray-800 text-[20px] font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
