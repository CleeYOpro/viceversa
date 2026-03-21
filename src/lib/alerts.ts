/**
 * AI and mock alerts derived from full user/patient data.
 * Uses Gemini when available; falls back to rule-based mock alerts.
 */

import type { LovedOne, Medication, HealthLog } from '../types';
import { generateAIAlerts, type AIAlertItem } from './gemini';

export interface HealthEntryForAlerts {
  date: string;
  bp: string;
  glucose: number;
  mood: string;
  notes: string;
}

export interface UserContextJson {
  patient: LovedOne;
  village: { id: string; name: string };
  medications: Medication[];
  logs: HealthLog[];
  healthHistory?: HealthEntryForAlerts[];
  _rawJson?: string;
}

export interface MockAlert {
  id: string;
  type: 'ai_insight' | 'vitals_trend' | 'sensor' | 'medication' | 'resolved';
  eyebrow: string;
  title: string;
  timestamp: string;
  primaryAction?: string;
  secondaryAction?: string;
  footer?: string;
}

/** Convert AI-generated alert to display format */
function aiAlertToMock(ai: AIAlertItem, index: number): MockAlert {
  const urgencyLabels: Record<string, string> = {
    ai_insight: 'AI INTELLIGENCE',
    vitals_trend: 'VITALS TREND',
    medication: 'MEDICATION',
    general: 'ALERT',
  };
  return {
    id: `ai-${index}`,
    type: ai.type === 'general' ? 'ai_insight' : ai.type,
    eyebrow: urgencyLabels[ai.type] ?? 'ALERT',
    title: ai.title,
    timestamp: 'Today',
    primaryAction: ai.suggestedAction,
  };
}

/**
 * Build alerts from full user context. Tries Gemini first; falls back to rule-based mock.
 */
export async function buildAlertsFromUserData(ctx: UserContextJson): Promise<MockAlert[]> {
  const { patient, medications, logs, healthHistory } = ctx;
  const aiCtx = {
    patient: { name: patient.name, conditions: patient.conditions, allergies: patient.allergies },
    medications: medications.map(m => ({ name: m.name, dose: m.dosage, taken: true })),
    healthHistory: healthHistory ?? [],
    recentLogs: logs.map(l => ({ type: l.type, notes: l.notes })),
  };
  const aiAlerts = await generateAIAlerts(aiCtx);
  if (aiAlerts.length > 0) {
    const converted = aiAlerts.map((a, i) => aiAlertToMock(a, i));
    const resolved = buildResolvedAlerts(logs);
    return [...converted, ...resolved];
  }
  return buildMockAlertsFromUserData(ctx);
}

function buildResolvedAlerts(logs: HealthLog[]): MockAlert[] {
  const recent = logs.slice(-2);
  if (recent.length > 0) {
    return recent.map((l, i) => ({
      id: `resolved-${i}`,
      type: 'resolved' as const,
      eyebrow: '',
      title: l.notes || `${l.type} logged`,
      timestamp: typeof l.timestamp?.toDate === 'function'
        ? new Date(l.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Earlier today',
    }));
  }
  return [
    { id: 'resolved-0', type: 'resolved' as const, eyebrow: '', title: 'Hydration Goal Met', timestamp: '11:00 AM' },
    { id: 'resolved-1', type: 'resolved' as const, eyebrow: '', title: 'Morning Meds Confirmed', timestamp: '08:15 AM' },
  ];
}

/** Rule-based fallback when Gemini unavailable */
function buildMockAlertsFromUserData(ctx: UserContextJson): MockAlert[] {
  const { patient, medications, logs } = ctx;
  const alerts: MockAlert[] = [];
  const hasDementia = patient.conditions.some(c =>
    c.toLowerCase().includes('dementia') || c.toLowerCase().includes('alzheimer')
  );
  const hasHypertension = patient.conditions.some(c =>
    c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('blood pressure')
  );
  const hasMeds = medications.length > 0;
  const recentLogs = logs.slice(-5);

  if (hasDementia) {
    alerts.push({
      id: 'ai-1',
      type: 'ai_insight',
      eyebrow: 'AI INTELLIGENCE',
      title: `Confusion events may cluster between 4–6pm for ${patient.name} (sundowning)`,
      timestamp: 'Today, 4:12 PM',
      secondaryAction: 'Log Observation',
    });
  } else {
    alerts.push({
      id: 'ai-1',
      type: 'ai_insight',
      eyebrow: 'AI INTELLIGENCE',
      title: `Care pattern insight: no notable clusters in recent data for ${patient.name}`,
      timestamp: 'Today',
      secondaryAction: 'Log Observation',
    });
  }

  if (hasHypertension) {
    alerts.push({
      id: 'bp-1',
      type: 'vitals_trend',
      eyebrow: 'VITALS TREND',
      title: 'BP readings elevated 3 days in a row — consider notifying doctor',
      timestamp: '3 days ago',
      primaryAction: 'Notify Doctor',
    });
  }

  alerts.push({
    id: 'sensor-1',
    type: 'sensor',
    eyebrow: 'SENSOR ALERT',
    title: 'No activity logged for 8 hours',
    timestamp: 'Today',
    primaryAction: 'Ping Caregiver',
    secondaryAction: "I'm checking",
  });

  if (hasMeds) {
    const medNames = medications.map(m => m.name).join(', ');
    alerts.push({
      id: 'med-1',
      type: 'medication',
      eyebrow: 'URGENT MEDICATION',
      title: `Missed evening dose detected — ${medications[0]?.name ?? 'medication'}`,
      timestamp: 'Today',
      footer: `Active meds: ${medNames}. Protocol: Remind via Voice Hub.`,
    });
  }

  return [...alerts, ...buildResolvedAlerts(logs)];
}
