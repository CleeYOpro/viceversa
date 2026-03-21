import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFirestore } from '../../../hooks/useFirestore';
import { AIInsight, HealthLog } from '../../../types';
import { generateInsight, askAI } from '../../../lib/gemini';
import { InsightCard } from '../../../components/InsightCard';
import { DisclaimerBanner } from '../../../components/DisclaimerBanner';
import { Timestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../stores/useAuthStore';

export default function InsightsScreen() {
  const { villageId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: insights } = useFirestore<AIInsight>(`villages/${villageId}/insights`);
  const { data: logs } = useFirestore<HealthLog>(`villages/${villageId}/logs`);
  
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const summary = await generateInsight(logs);
      await addDoc(collection(db, 'villages', villageId as string, 'insights'), {
        summary,
        generatedAt: Timestamp.now(),
        authorId: user?.uid,
      });
    } catch (e: any) {
      Alert.alert("Error", "Unable to generate insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await askAI(question, logs.slice(0, 10)); // send recent context
      Alert.alert("AI Assistant", response);
      setQuestion('');
    } catch (e: any) {
      Alert.alert("Error", "Unable to reach AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      <DisclaimerBanner variant="ai" />
      <View className="p-4 flex-1">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 min-h-[44px] justify-center">
          <Text className="text-[#2589BD] text-[18px] font-bold">← Back</Text>
        </TouchableOpacity>

        <Text className="text-[28px] font-bold text-gray-900 mb-4">Care Insights</Text>
        
        <TouchableOpacity 
          className="bg-[#0B6E4F] rounded-xl p-4 items-center justify-center min-h-[56px] mb-4 w-full"
          onPress={handleGenerate}
          disabled={loading}
        >
          <Text className="text-white text-[18px] font-bold">
            {loading ? 'Processing...' : 'Generate New Insight'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row mb-6 w-full">
           <TextInput
              className="flex-1 bg-white border border-gray-300 rounded-lg p-3 min-h-[44px] text-[16px] mr-2"
              placeholder="Ask a question about logs..."
              value={question}
              onChangeText={setQuestion}
           />
           <TouchableOpacity 
             className="bg-purple-600 rounded-lg p-3 justify-center min-w-[44px]"
             onPress={handleAsk}
             disabled={loading || !question.trim()}
           >
             <Text className="text-white font-bold">Ask</Text>
           </TouchableOpacity>
        </View>

        <FlatList
          data={insights.sort((a, b) => b.generatedAt.seconds - a.generatedAt.seconds)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <InsightCard insight={item} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
