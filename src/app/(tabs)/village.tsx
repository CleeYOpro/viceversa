import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useRealtime } from '../../hooks/useRealtime';
import { VillageSelector } from '../../components/VillageSelector';
import { ChatMessage } from '../../components/ChatMessage';
import { useAuthStore } from '../../stores/useAuthStore';
import { rtdb } from '../../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { Send } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function VillageChatScreen() {
  const { activeVillageId, villages, setActiveVillage } = useVillageStore();
  const { user } = useAuthStore();
  const { messages } = useRealtime(activeVillageId || '');
  const [text, setText] = useState('');
  const router = useRouter();

  const handleSend = async () => {
    if (!text.trim() || !activeVillageId || !user) return;
    
    const msgRef = push(ref(rtdb, `villages/${activeVillageId}/messages`));
    await set(msgRef, {
      senderId: user.uid,
      senderName: user.email?.split('@')[0] || 'User',
      text: text.trim(),
      timestamp: Date.now(),
    });
    
    setText('');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50 pt-10"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View className="bg-white px-2 pt-2 border-b border-gray-200 shadow-sm flex-row items-center justify-between z-10 w-full">
        <View className="flex-1 flex-row">
          <VillageSelector 
            villages={villages} 
            activeVillageId={activeVillageId} 
            onSelect={setActiveVillage} 
          />
        </View>
        {activeVillageId && (
          <TouchableOpacity 
            onPress={() => router.push(`/village/${activeVillageId}`)}
            className="p-3 ml-2 min-h-[44px] justify-center items-center"
          >
             <Text className="text-[#2589BD] font-bold text-[16px]">Settings</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatMessage message={item} isOwnMessage={item.senderId === user?.uid} />
        )}
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
      />

      <View className="p-4 bg-white border-t border-gray-200 flex-row items-center w-full">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 min-h-[44px] text-[16px] mr-3"
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity 
          className="bg-[#0B6E4F] w-12 h-12 rounded-full items-center justify-center min-w-[44px] min-h-[44px]"
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
