import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authSchema } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'expo-router';

const registerSchema = authSchema.extend({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
});

export default function Register() {
  const { register, loading } = useAuthStore();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', displayName: '' }
  });

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    try {
      await register(data.email, data.password, data.displayName);
      router.replace('/onboarding/step1');
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-12">
      <Text className="text-[32px] font-bold text-gray-900 mb-8 text-center mt-10">Create Account</Text>
      
      {errorMsg ? <Text className="text-red-500 text-[16px] mb-4 text-center">{errorMsg}</Text> : null}

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Display Name</Text>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-2 min-h-[44px]"
            placeholder="Your name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.displayName && <Text className="text-red-500 text-[14px] mb-4">{String(errors.displayName.message)}</Text>}

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-2 min-h-[44px]"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text className="text-red-500 text-[14px] mb-4">{String(errors.email.message)}</Text>}

      <Text className="text-[18px] font-bold text-gray-800 mt-2 mb-2">Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-2 min-h-[44px]"
            placeholder="Min 8 characters"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text className="text-red-500 text-[14px] mb-4">{String(errors.password.message)}</Text>}

      <TouchableOpacity
        className="bg-[#2589BD] rounded-xl p-4 mt-6 items-center justify-center min-h-[56px]"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text className="text-white text-[20px] font-bold">
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6 items-center min-h-[44px] justify-center mb-12"
        onPress={() => router.back()}
      >
        <Text className="text-[18px] text-gray-600 font-semibold">Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
