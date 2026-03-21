import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Village } from '../types';

interface VillageSelectorProps {
  villages: Village[];
  activeVillageId: string | null;
  onSelect: (villageId: string) => void;
}

export const VillageSelector: React.FC<VillageSelectorProps> = ({ villages, activeVillageId, onSelect }) => {
  if (villages.length === 0) return null;

  return (
    <View className="flex-row p-2 w-full overflow-hidden">
      {villages.map(village => (
        <TouchableOpacity 
          key={village.id}
          onPress={() => onSelect(village.id)}
          className={`p-3 mr-2 rounded-lg border border-gray-200 ${activeVillageId === village.id ? 'bg-[#2589BD]' : 'bg-gray-100'}`}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text className={`font-bold text-[18px] ${activeVillageId === village.id ? 'text-white' : 'text-gray-800'}`}>
            {village.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
