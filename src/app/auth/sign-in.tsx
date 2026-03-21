import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const { signIn, loading } = useAuthStore();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrorMsg('Invalid email or password');
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-[32px] font-bold text-gray-900 mb-8 text-center">Welcome Back</Text>
      
      {errorMsg ? <Text className="text-red-500 text-[16px] mb-4 text-center">{errorMsg}</Text> : null}

      <Text className="text-[18px] font-bold text-gray-800 mb-2">Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-1 min-h-[44px]"
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
            className="bg-gray-50 border text-[18px] border-gray-300 rounded-lg p-4 mb-1 min-h-[44px]"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text className="text-red-500 text-[14px] mb-4">{String(errors.password.message)}</Text>}

      <TouchableOpacity
        className="bg-[#0B6E4F] rounded-xl p-4 mt-6 items-center justify-center min-h-[56px]"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text className="text-white text-[20px] font-bold">
          {loading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6 items-center min-h-[44px] justify-center"
        onPress={() => router.push('/auth/register')}
      >
        <Text className="text-[18px] text-[#2589BD] font-semibold">New to CareSync? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
