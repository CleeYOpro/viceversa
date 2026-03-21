import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useVillageStore } from '../../stores/useVillageStore';
import { useFirestore } from '../../hooks/useFirestore';
import { TaskCard } from '../../components/TaskCard';
import { Task } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function CalendarScreen() {
  const { activeVillageId } = useVillageStore();
  const { user } = useAuthStore();
  const { data: tasks } = useFirestore<Task>(activeVillageId ? `villages/${activeVillageId}/tasks` : '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const markedDates: any = {};
  tasks.forEach(t => {
    if (t.dueDateTime) {
      const dateStr = t.dueDateTime.toDate().toISOString().split('T')[0];
      markedDates[dateStr] = { marked: true, dotColor: '#0B6E4F' };
    }
  });

  markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#2589BD' };

  const selectedTasks = tasks.filter(t => {
    if (!t.dueDateTime) return false;
    return t.dueDateTime.toDate().toISOString().split('T')[0] === selectedDate;
  });

  const handleClaim = async (taskId: string) => {
    if (!activeVillageId || !user) return;
    await updateDoc(doc(db, 'villages', activeVillageId, 'tasks', taskId), {
      assigneeId: user.uid,
    });
  };

  const handleComplete = async (taskId: string) => {
    if (!activeVillageId) return;
    await updateDoc(doc(db, 'villages', activeVillageId, 'tasks', taskId), {
      status: 'completed',
    });
  };

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      <Calendar
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#2589BD',
          todayTextColor: '#0B6E4F',
          arrowColor: '#2589BD',
        }}
      />
      <View className="flex-1 p-4">
        <Text className="text-[22px] font-bold text-gray-900 mb-4">Tasks for {selectedDate}</Text>
        <FlatList
          data={selectedTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard 
              task={item} 
              currentUserId={user?.uid || ''} 
              userRole="admin" 
              onClaim={handleClaim}
              onComplete={handleComplete}
            />
          )}
          ListEmptyComponent={
            <Text className="text-gray-500 text-[18px]">No tasks scheduled mapped onto today.</Text>
          }
        />
      </View>
    </View>
  );
}
