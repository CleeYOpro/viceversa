import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { HealthLog, DoseLog, Task } from '../types';

export async function compilePdfData(villageId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logsQuery = query(
    collection(db, 'villages', villageId, 'logs'),
    where('timestamp', '>=', sevenDaysAgo),
    orderBy('timestamp', 'desc')
  );
  
  const dosesQuery = query(
    collection(db, 'villages', villageId, 'doseLogs'),
    where('timestamp', '>=', sevenDaysAgo),
    orderBy('timestamp', 'desc')
  );

  const tasksQuery = query(
    collection(db, 'villages', villageId, 'tasks'),
    where('dueDateTime', '>=', sevenDaysAgo)
  );

  const [logsSnap, dosesSnap, tasksSnap] = await Promise.all([
    getDocs(logsQuery),
    getDocs(dosesQuery),
    getDocs(tasksQuery)
  ]);

  return {
    logs: logsSnap.docs.map(d => d.data() as HealthLog),
    doses: dosesSnap.docs.map(d => d.data() as DoseLog),
    tasks: tasksSnap.docs.map(d => d.data() as Task)
  };
}

export async function generatePdf(data: any) {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      </head>
      <body style="font-family: Helvetica Neue; padding: 20px;">
        <h1>Patient Info Summary</h1>
        <p>This document contains a 7-day health summary.</p>
        
        <h2>Health Log Summary</h2>
        <ul>
          ${data.logs.map((l: any) => `<li>${new Date(l.timestamp.toDate()).toLocaleString()}: ${l.type} - ${l.notes}</li>`).join('')}
        </ul>

        <h2>Medication Adherence (Doses)</h2>
        <ul>
           ${data.doses.map((d: any) => `<li>${new Date(d.timestamp.toDate()).toLocaleString()}: Med ID ${d.medicationId}</li>`).join('')}
        </ul>

        <h2>Upcoming Tasks</h2>
        <ul>
           ${data.tasks.map((t: any) => `<li>${t.title} - ${t.status}</li>`).join('')}
        </ul>

        <div style="margin-top: 40px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
          <strong>NOT MEDICAL ADVICE — this document is for informational purposes only</strong>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (error) {
    throw new Error("Unable to generate PDF. Please try again.");
  }
}
