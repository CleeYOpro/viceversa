import React from 'react';
import { View, Text } from 'react-native';

interface DisclaimerBannerProps {
  variant: 'medical' | 'ai';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ variant }) => {
  const text = variant === 'medical' 
    ? 'NOT MEDICAL ADVICE — consult your doctor or pharmacist'
    : 'AI responses are NOT MEDICAL ADVICE — consult your doctor or pharmacist';
  return (
    <View className="bg-amber-100 p-3 border-b-2 border-amber-300 w-full">
      <Text className="text-amber-900 text-[18px] text-center font-bold">
        {text}
      </Text>
    </View>
  );
};
