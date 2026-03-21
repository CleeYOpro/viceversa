import React from 'react';
import { View, Text } from 'react-native';
import { Medication } from '../types';

interface MedicationCardProps {
  medication: Medication;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 w-full">
      <Text className="text-[22px] font-bold text-gray-900">{medication.name}</Text>
      <Text className="text-[18px] text-gray-700 mt-1">{medication.dosage} • {medication.frequency.replace('_', ' ')}</Text>
      
      {medication.notes && (
        <Text className="text-[16px] text-gray-500 mt-2">{medication.notes}</Text>
      )}

      <View className="mt-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
        <Text className="text-blue-800 font-semibold text-[16px]">
          Scheduled times: {medication.scheduleTimes.join(', ')}
        </Text>
      </View>
    </View>
  );
};
