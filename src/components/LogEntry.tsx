import React from 'react';
import { View, Text, Image } from 'react-native';
import { HealthLog } from '../types';

interface LogEntryProps {
  log: HealthLog;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row w-full">
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[18px] font-bold text-gray-800 capitalize">{log.type}</Text>
          <Text className="text-[14px] text-gray-500">
            {new Date(log.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text className="text-[18px] text-gray-700 leading-relaxed">{log.notes}</Text>
      </View>
      {log.photoUrl && (
        <Image 
          source={{ uri: log.photoUrl }} 
          className="w-16 h-16 rounded-lg ml-3 bg-gray-200"
          resizeMode="cover"
        />
      )}
    </View>
  );
};
