import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useVillageStore } from '../../stores/useVillageStore';
import { useFirestore } from '../../hooks/useFirestore';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { OfflineBanner } from '../../components/OfflineBanner';
import { VillageSelector } from '../../components/VillageSelector';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { TaskCard } from '../../components/TaskCard';
import { LogEntry } from '../../components/LogEntry';
import { InsightCard } from '../../components/InsightCard';
import { HealthLog, Task, AIInsight } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { villages, activeVillageId, setActiveVillage } = useVillageStore();

  const { data: tasks, loading: tasksLoading } = useFirestore<Task>(
    activeVillageId ? `villages/${activeVillageId}/tasks` : ''
  );
  
  const { data: logs, loading: logsLoading } = useFirestore<HealthLog>(
    activeVillageId ? `villages/${activeVillageId}/logs` : ''
  );

  const { data: insights } = useFirestore<AIInsight>(
    activeVillageId ? `villages/${activeVillageId}/insights` : ''
  );

  if (!activeVillageId) {
    return <SkeletonLoader />;
  }

  const todayTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);
  const recentLogs = logs.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds).slice(0, 3);
  const latestInsight = insights.sort((a, b) => b.generatedAt.seconds - a.generatedAt.seconds)[0];

  return (
    <View className="flex-1 bg-gray-50">
      <OfflineBanner />
      <DisclaimerBanner variant="medical" />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <VillageSelector 
          villages={villages} 
          activeVillageId={activeVillageId} 
          onSelect={setActiveVillage} 
        />
        
        <View className="mt-6 mb-4">
          <Text className="text-[22px] font-bold text-gray-900 mb-3">Today's Tasks</Text>
          {tasksLoading ? <SkeletonLoader /> : (
            todayTasks.length > 0 
              ? todayTasks.map(task => (
                  <TaskCard key={task.id} task={task} currentUserId={user?.uid} userRole="admin" />
                ))
              : <Text className="text-gray-500 text-[16px]">No pending tasks for today.</Text>
          )}
        </View>

        {latestInsight && (
          <View className="mb-6">
            <Text className="text-[22px] font-bold text-gray-900 mb-3">Latest AI Insight</Text>
            <InsightCard insight={latestInsight} />
          </View>
        )}

        <View className="mb-20">
          <Text className="text-[22px] font-bold text-gray-900 mb-3">Recent Logs</Text>
          {logsLoading ? <SkeletonLoader /> : (
            recentLogs.length > 0 
              ? recentLogs.map(log => <LogEntry key={log.id} log={log} />)
              : <Text className="text-gray-500 text-[16px]">No recent health logs.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
