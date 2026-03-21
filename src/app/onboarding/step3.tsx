import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function OnboardingStep3() {
  const router = useRouter();
  const { villageId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!villageId) return;
    setLoading(true);

    try {
      if (name.trim()) {
        await setDoc(doc(db, 'villages', villageId as string, 'lovedOne', 'profile'), {
          name,
          dob,
          conditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
          allergies: [],
          emergencyContact: { name: '', phone: '', relationship: '' }
        });
      }
      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-12">
      <Text className="text-[32px] font-bold text-gray-900 mb-2 mt-8">Loved One Profile</Text>
      <Text className="text-[18px] text-gray-600 mb-8">
        Tell us a little about the person you're caring for.
      </Text>

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Name</Text>
      <TextInput
        className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-6 min-h-[44px]"
        placeholder="e.g., Martha"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Date of Birth</Text>
      <TextInput
        className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-6 min-h-[44px]"
        placeholder="YYYY-MM-DD"
        value={dob}
        onChangeText={setDob}
      />

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Medical Conditions (comma separated)</Text>
      <TextInput
        className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-8 min-h-[80px]"
        multiline
        placeholder="e.g., Hypertension, Diabetes"
        value={conditions}
        onChangeText={setConditions}
      />

      <TouchableOpacity
        className="bg-[#0B6E4F] rounded-xl p-4 items-center justify-center min-h-[56px] mb-4"
        onPress={handleFinish}
        disabled={loading}
      >
        <Text className="text-white text-[20px] font-bold">
          {loading ? 'Saving...' : 'Finish Setup'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="py-4 items-center justify-center mb-12"
        onPress={() => router.replace('/(tabs)')}
      >
        <Text className="text-gray-500 text-[18px] font-semibold">Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
