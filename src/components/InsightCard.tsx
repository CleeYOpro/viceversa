import React from 'react';
import { View, Text } from 'react-native';
import { AIInsight } from '../types';
import { Sparkles } from 'lucide-react-native';

interface InsightCardProps {
  insight: AIInsight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return (
    <View className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-3 shadow-sm w-full">
      <View className="flex-row items-center mb-2">
        <Sparkles size={24} color="#7E22CE" />
        <Text className="text-[20px] font-bold text-purple-800 ml-2">AI Care Insight</Text>
      </View>
      <Text className="text-[18px] text-gray-800 leading-relaxed">
        {insight.summary}
      </Text>
      <Text className="text-[14px] text-purple-600 mt-2 text-right">
        Generated {new Date(insight.generatedAt.toDate()).toLocaleDateString()}
      </Text>
    </View>
  );
};
