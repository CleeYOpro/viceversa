import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFirestore } from '../../../hooks/useFirestore';
import { Member } from '../../../types';
import { useAuthStore } from '../../../stores/useAuthStore';
import { RoleGuard } from '../../../components/RoleGuard';

export default function MembersScreen() {
  const { villageId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: members, updateDocument, deleteDocument } = useFirestore<Member>(`villages/${villageId}/members`);

  const currentUserMember = members.find(m => m.userId === user?.uid);
  const currentUserRole = currentUserMember?.role || 'aide';

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateDocument(memberId, { role: newRole });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await deleteDocument(memberId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4 pt-10">
      <TouchableOpacity onPress={() => router.back()} className="mb-6 min-h-[44px] justify-center">
        <Text className="text-[#2589BD] text-[18px] font-bold">← Back to Settings</Text>
      </TouchableOpacity>

      <Text className="text-[28px] font-bold text-gray-900 mb-6">Village Members</Text>

      <FlatList
        data={members}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <View className="bg-white p-4 justify-between items-center flex-row rounded-xl shadow-sm mb-3 border border-gray-200 min-h-[60px] w-full">
             <View>
               <Text className="text-[18px] font-bold text-gray-900">{item.displayName}</Text>
               <Text className="text-[14px] text-gray-500 capitalize">{item.role}</Text>
             </View>
             
             <RoleGuard requiredRole="admin" userRole={currentUserRole}>
               {item.userId !== user?.uid && (
                 <View className="flex-row">
                   <TouchableOpacity 
                     onPress={() => handleRoleChange(item.userId, item.role === 'caregiver' ? 'aide' : 'caregiver')}
                     className="bg-gray-100 px-3 py-2 rounded-lg mr-2"
                   >
                     <Text className="text-gray-800 font-semibold text-[14px]">Toggle Role</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     onPress={() => handleRemove(item.userId)}
                     className="bg-red-100 px-3 py-2 rounded-lg"
                   >
                     <Text className="text-red-700 font-semibold text-[14px]">Remove</Text>
                   </TouchableOpacity>
                 </View>
               )}
             </RoleGuard>
          </View>
        )}
      />
    </View>
  );
}
