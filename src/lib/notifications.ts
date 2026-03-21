import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Medication, Task } from '../types';

// Push notifications (remote) are not supported in Expo Go on SDK 53+.
// All push-token related calls are guarded behind this check.
const isDevBuild =
  Constants.appOwnership !== 'expo' &&
  (Platform.OS === 'ios' || Platform.OS === 'android');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!isDevBuild) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function registerToken(userId: string) {
  if (!isDevBuild) return;
  try {
    const tokenRecord = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });
    if (tokenRecord.data) {
      await setDoc(doc(db, 'users', userId), { expoPushToken: tokenRecord.data }, { merge: true });
    }
  } catch {
    // silently ignore in environments that don't support push tokens
  }
}

export async function scheduleMedicationReminder(med: Medication) {
  if (!isDevBuild) return;
  for (const time of med.scheduleTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `It is time to take ${med.name} (${med.dosage})`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
}

export async function scheduleTaskReminder(task: Task) {
  if (!isDevBuild) return;
  if (!task.dueDateTime || !task.assigneeId) return;

  const date = task.dueDateTime.toDate();
  if (date > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Your task "${task.title}" is due now.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
}
