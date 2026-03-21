import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  return (
    <View className={`mb-3 flex w-full ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[80%] p-3 rounded-2xl ${isOwnMessage ? 'bg-[#2589BD] rounded-tr-none' : 'bg-gray-200 rounded-tl-none'}`}>
        {!isOwnMessage && (
          <Text className="text-[14px] font-bold text-gray-700 mb-1">{message.senderName}</Text>
        )}
        <Text className={`text-[18px] ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
          {message.text}
        </Text>
        <Text className={`text-[12px] mt-1 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};
