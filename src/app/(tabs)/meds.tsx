import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useFirestore } from '../../hooks/useFirestore';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { MedicationCard } from '../../components/MedicationCard';
import { QuickLogButton } from '../../components/QuickLogButton';
import { Medication } from '../../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { scheduleMedicationReminder } from '../../lib/notifications';

export default function MedsScreen() {
  const { activeVillageId } = useVillageStore();
  const { data: medications } = useFirestore<Medication>(activeVillageId ? `villages/${activeVillageId}/medications` : '');
  const [modalVisible, setModalVisible] = useState(false);
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

  const handleSave = async () => {
    if (!activeVillageId || !name.trim()) return;
    
    const newMed: any = {
      name,
      dosage,
      frequency: 'daily',
      scheduleTimes: ['09:00']
    };

    await addDoc(collection(db, 'villages', activeVillageId, 'medications'), newMed);
    await scheduleMedicationReminder(newMed);
    
    setName('');
    setDosage('');
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      <DisclaimerBanner variant="medical" />
      <View className="flex-1 p-4">
        <Text className="text-[28px] font-bold text-gray-900 mb-4">Medications</Text>
        
        <FlatList
          data={medications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MedicationCard medication={item} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
      
      <QuickLogButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl min-h-[50%]">
            <Text className="text-[22px] font-bold text-gray-900 mb-4">Add Medication</Text>
            
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-[18px] mb-4 min-h-[44px]"
              placeholder="Medication Name"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-[18px] mb-6 min-h-[44px]"
              placeholder="Dosage (e.g., 20mg)"
              value={dosage}
              onChangeText={setDosage}
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
                <Text className="text-[18px] font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
