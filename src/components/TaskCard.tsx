import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Task, MemberRole } from '../types';

interface TaskCardProps {
  task: Task;
  onClaim?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  currentUserId: string;
  userRole: MemberRole;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClaim, onComplete, currentUserId, userRole }) => {
  const canClaim = !task.assigneeId && userRole !== 'aide';
  const canComplete = task.assigneeId === currentUserId && task.status !== 'completed';

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-200">
      <Text className="text-[22px] font-bold text-gray-900">{task.title}</Text>
      {task.description && <Text className="text-[18px] text-gray-600 mt-1">{task.description}</Text>}
      
      <View className="flex-row justify-between items-center mt-4">
        <View className="bg-gray-100 px-3 py-1 rounded-full">
          <Text className="text-gray-600 font-medium capitalize text-[14px]">
            {task.status.replace('_', ' ')}
          </Text>
        </View>
        
        <View className="flex-row space-x-2">
          {canClaim && onClaim && (
            <TouchableOpacity 
              onPress={() => onClaim(task.id)}
              className="bg-[#2589BD] px-4 py-2 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center ml-2"
            >
              <Text className="text-white font-semibold text-[18px]">Claim</Text>
            </TouchableOpacity>
          )}
          
          {canComplete && onComplete && (
            <TouchableOpacity 
              onPress={() => onComplete(task.id)}
              className="bg-[#0B6E4F] px-4 py-2 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center ml-2"
            >
              <Text className="text-white font-semibold text-[18px]">Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
