import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useFirestore } from '../../hooks/useFirestore';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { LogEntry } from '../../components/LogEntry';
import { QuickLogButton } from '../../components/QuickLogButton';
import { HealthLog } from '../../types';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/useAuthStore';

export default function LogScreen() {
  const { activeVillageId } = useVillageStore();
  const { user } = useAuthStore();
  const { data: logs, loading } = useFirestore<HealthLog>(activeVillageId ? `villages/${activeVillageId}/logs` : '');
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');

  const handleSave = async () => {
    if (!activeVillageId || !user || !note.trim()) return;
    
    await addDoc(collection(db, 'villages', activeVillageId, 'logs'), {
      type: 'note',
      timestamp: Timestamp.now(),
      notes: note,
      authorId: user.uid,
    });
    setNote('');
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      <DisclaimerBanner variant="medical" />
      <View className="flex-1 p-4">
        <Text className="text-[28px] font-bold text-gray-900 mb-4">Health Log</Text>
        
        <FlatList
          data={logs.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogEntry log={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
      
      <QuickLogButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl min-h-[50%]">
            <Text className="text-[22px] font-bold text-gray-900 mb-4">Add Log Entry</Text>
            
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-h-[120px] text-[18px] mb-6"
              multiline
              placeholder="What happened? E.g., Mom ate a full breakfast..."
              value={note}
              onChangeText={setNote}
            />

            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 p-4 rounded-xl items-center mr-2"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-[18px] font-bold text-gray-800">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-[#0B6E4F] p-4 rounded-xl items-center ml-2"
                onPress={handleSave}
              >
                <Text className="text-[18px] font-bold text-white">Save Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
