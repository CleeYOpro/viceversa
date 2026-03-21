import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Medication, Task } from '../types';

// Push notifications are not supported in Expo Go on SDK 53+.
// We lazy-require expo-notifications only in dev builds to avoid the crash.
const isDevBuild =
  Constants.appOwnership !== 'expo' &&
  (Platform.OS === 'ios' || Platform.OS === 'android');

function getNotifications() {
  if (!isDevBuild) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-notifications') as typeof import('expo-notifications');
}

// Only set the handler in dev builds
if (isDevBuild) {
  const N = getNotifications();
  if (N) {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
}

export async function requestPermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const { status: existingStatus } = await N.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function registerToken(userId: string) {
  const N = getNotifications();
  if (!N) return;
  try {
    const tokenRecord = await N.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });
    if (tokenRecord.data) {
      // Token registration — skipped in mock mode (no Firebase)
      console.log('[notifications] push token:', tokenRecord.data);
    }
  } catch {
    // silently ignore
  }
}

export async function scheduleMedicationReminder(med: Medication) {
  const N = getNotifications();
  if (!N) return;
  for (const time of med.scheduleTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    await N.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `It is time to take ${med.name} (${med.dosage})`,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
}

export async function scheduleTaskReminder(task: Task) {
  const N = getNotifications();
  if (!N) return;
  if (!task.dueDateTime || !task.assigneeId) return;

  const date = task.dueDateTime.toDate();
  if (date > new Date()) {
    await N.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Your task "${task.title}" is due now.`,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
}
