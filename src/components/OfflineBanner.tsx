import React from 'react';
import { View, Text } from 'react-native';
import { useOffline } from '../hooks/useOffline';

export const OfflineBanner = () => {
  const isOffline = useOffline();
  
  if (!isOffline) return null;

  return (
    <View className="bg-red-500 p-2 w-full">
      <Text className="text-white text-[18px] text-center font-bold">
        You are currently offline. Local changes will sync when connected.
      </Text>
    </View>
  );
};
