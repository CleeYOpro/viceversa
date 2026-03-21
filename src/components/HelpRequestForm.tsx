import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { helpRequestSchema } from '../lib/utils';
import { UrgencyLevel } from '../types';

interface HelpRequestFormData {
  urgency: UrgencyLevel;
  description: string;
  duration: string;
  location?: string;
}

interface HelpRequestFormProps {
  onSubmit: (data: HelpRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ onSubmit, isLoading }) => {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<HelpRequestFormData>({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: { urgency: 'medium' }
  });

  const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high', 'emergency'];
  const activeUrgency = watch('urgency');

  return (
    <View className="w-full">
      <Text className="text-[18px] font-bold text-gray-800 mb-2">Urgency Level</Text>
      <View className="flex-row flex-wrap mb-4">
        {urgencyLevels.map(level => (
          <TouchableOpacity
            key={level}
            onPress={() => setValue('urgency', level)}
            className={`p-3 mr-2 mb-2 rounded-lg border border-gray-300 min-w-[44px] min-h-[44px] justify-center ${activeUrgency === level ? 'bg-[#0B6E4F]' : 'bg-gray-100'}`}
          >
            <Text className={`text-[16px] font-semibold capitalize ${activeUrgency === level ? 'text-white' : 'text-gray-700'}`}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-[18px] font-bold text-gray-800 mb-2">What do you need help with?</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-white border text-[18px] border-gray-300 rounded-lg p-3 min-h-[100px] mb-1"
            multiline
            placeholder="E.g., Need someone to stay with Mom for 2 hours..."
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.description && <Text className="text-red-500 text-[14px] mb-3">{errors.description.message}</Text>}

      <Text className="text-[18px] font-bold text-gray-800 mt-3 mb-2">Expected Duration</Text>
      <Controller
        control={control}
        name="duration"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-white border text-[18px] border-gray-300 rounded-lg p-3 min-h-[44px] mb-1"
            placeholder="E.g., 2 hours"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.duration && <Text className="text-red-500 text-[14px] mb-3">{errors.duration.message}</Text>}

      <TouchableOpacity
        className="bg-red-500 rounded-xl p-4 mt-6 items-center flex-row justify-center min-h-[56px]"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <Text className="text-white text-[20px] font-bold">
          {isLoading ? 'Sending Request...' : 'Request Help Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
