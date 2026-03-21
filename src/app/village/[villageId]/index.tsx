import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFirestore } from '../../../hooks/useFirestore';
import { LovedOne } from '../../../types';
import { compilePdfData, generatePdf } from '../../../lib/pdf';
import { FileDown, Users, Sparkles, HeartHandshake } from 'lucide-react-native';

export default function VillageSettingsScreen() {
  const { villageId } = useLocalSearchParams();
  const router = useRouter();
  
  const { data: lovedOnes } = useFirestore<LovedOne>(`villages/${villageId}/lovedOne`);
  const profile = lovedOnes[0];

  const handleExport = async () => {
    try {
      const data = await compilePdfData(villageId as string);
      await generatePdf(data);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to generate PDF. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 pt-10">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-[#2589BD] text-[18px] font-bold">← Back to Village</Text>
      </TouchableOpacity>

      <Text className="text-[32px] font-bold text-gray-900 mb-6">Village Controls</Text>

      {profile && (
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 w-full">
          <Text className="text-[22px] font-bold text-gray-900 mb-2">Loved One: {profile.name}</Text>
          <Text className="text-[18px] text-gray-600 mb-2">DOB: {profile.dob}</Text>
          <Text className="text-[18px] text-gray-600">Conditions: {profile.conditions?.join(', ')}</Text>
        </View>
      )}

      <View className="space-y-4">
        <TouchableOpacity 
          className="bg-white p-4 rounded-xl flex-row items-center border border-gray-200 min-h-[56px] mb-3 w-full"
          onPress={() => router.push(`/village/${villageId}/members`)}
        >
          <Users color="#0B6E4F" size={24} />
          <Text className="text-[18px] font-bold text-gray-800 ml-4">Manage Members</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white p-4 rounded-xl flex-row items-center border border-gray-200 min-h-[56px] mb-3 w-full"
          onPress={() => router.push(`/village/${villageId}/insights`)}
        >
          <Sparkles color="#7E22CE" size={24} />
          <Text className="text-[18px] font-bold text-gray-800 ml-4">AI Care Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white p-4 rounded-xl flex-row items-center border border-gray-200 min-h-[56px] mb-3 w-full"
          onPress={() => router.push(`/village/${villageId}/help`)}
        >
          <HeartHandshake color="#EF5350" size={24} />
          <Text className="text-[18px] font-bold text-gray-800 ml-4">Need Help Now?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-blue-50 p-4 rounded-xl flex-row items-center border border-blue-200 min-h-[56px] mb-8 w-full"
          onPress={handleExport}
        >
          <FileDown color="#2589BD" size={24} />
          <Text className="text-[18px] font-bold text-blue-900 ml-4">Export 7-Day Medical PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
