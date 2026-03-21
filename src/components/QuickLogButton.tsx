import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface QuickLogButtonProps {
  onPress: () => void;
}

export const QuickLogButton: React.FC<QuickLogButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-16 h-16 bg-[#0B6E4F] rounded-full items-center justify-center shadow-lg"
      onPress={onPress}
      style={{ minWidth: 44, minHeight: 44, elevation: 5 }}
    >
      <Text className="text-white text-3xl font-bold">+</Text>
    </TouchableOpacity>
  );
};
