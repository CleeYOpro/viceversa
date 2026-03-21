import React from 'react';
import { View } from 'react-native';

export const SkeletonLoader = () => {
  return (
    <View className="p-4 flex-col w-full space-y-4">
      <View className="h-24 bg-gray-300 rounded-lg" />
      <View className="h-24 bg-gray-300 rounded-lg" />
      <View className="h-24 bg-gray-300 rounded-lg" />
    </View>
  );
};
