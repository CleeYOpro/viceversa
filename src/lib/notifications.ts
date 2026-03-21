import * as Notifications from 'expo-notifications';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Medication, Task } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function registerToken(userId: string) {
  const tokenRecord = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  });
  if (tokenRecord.data) {
    await setDoc(doc(db, 'users', userId), { expoPushToken: tokenRecord.data }, { merge: true });
  }
}

export async function scheduleMedicationReminder(med: Medication) {
  for (const time of med.scheduleTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `It is time to take ${med.name} (${med.dosage})`,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
}

export async function scheduleTaskReminder(task: Task) {
  if (!task.dueDateTime || !task.assigneeId) return;

  const date = task.dueDateTime.toDate();
  if (date > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Your task "${task.title}" is due now.`,
      },
      trigger: date,
    });
  }
}
