import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HelpRequestForm } from '../../../components/HelpRequestForm';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../stores/useAuthStore';

export default function HelpScreen() {
  const { villageId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'villages', villageId as string, 'helpRequests'), {
        ...data,
        requestedBy: user.uid,
        status: 'pending',
      });
      Alert.alert("Request Sent", "We've notified nearby helpers in your village network.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 pt-10">
      <TouchableOpacity onPress={() => router.back()} className="mb-6 min-h-[44px] justify-center">
        <Text className="text-[#2589BD] text-[18px] font-bold">← Back</Text>
      </TouchableOpacity>
      <Text className="text-[28px] font-bold text-gray-900 mb-2">Need Help Now?</Text>
      <Text className="text-[18px] text-gray-600 mb-6">
        Broadcast a request to available caregivers or trusted neighbors.
      </Text>
      
      <HelpRequestForm onSubmit={handleSubmit} isLoading={loading} />
    </ScrollView>
  );
}
