import fc from 'fast-check';
import { scheduleMedicationReminder, scheduleTaskReminder } from '../../lib/notifications';
import * as Notifications from 'expo-notifications';
import { Timestamp } from 'firebase/firestore';

jest.mock('expo-notifications');

describe('Property 14: Notification Scheduled for Every Dose Time and Task Due Time', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('schedules exactly N notifications for N schedule times', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string().filter(s => /^\d{2}:\d{2}$/.test(s)),
          { minLength: 1, maxLength: 5 }
        ),
        async (times) => {
          jest.clearAllMocks();
          const med: any = { name: 'Meds', dosage: '10mg', scheduleTimes: times };
          await scheduleMedicationReminder(med);
          expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(times.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('schedules exactly 1 notification for a task with due datetime and assignee', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date(Date.now() + 10000), max: new Date(Date.now() + 1000000) }),
        async (futureDate) => {
          jest.clearAllMocks();
          const task: any = { 
            title: 'Task 1', 
            dueDateTime: Timestamp.fromDate(futureDate),
            assigneeId: 'user1'
          };
          await scheduleTaskReminder(task);
          expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
