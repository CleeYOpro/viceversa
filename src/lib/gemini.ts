import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HealthLog, LovedOne, Medication } from '../types';

function getApiKey(): string {
  const key =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY ||
    '';
  return String(key).trim();
}

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ChatContext {
  patient?: LovedOne | null;
  medications?: Medication[];
  logs?: HealthLog[];
}

function serializeForAI(obj: unknown): unknown {
  if (obj && typeof obj === 'object' && 'toDate' in obj && typeof (obj as { toDate: () => Date }).toDate === 'function') {
    return (obj as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(obj)) return obj.map(serializeForAI);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeForAI(v)])
    );
  }
  return obj;
}

export async function generateInsight(logs: HealthLog[]): Promise<string> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogs = logs.filter(log => log.timestamp.toDate() >= thirtyDaysAgo);
  const prompt = `Analyze these care logs and identify patterns: ${JSON.stringify(recentLogs)}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Ask AI with full patient context (JSON). Pass patient, medications, logs for better answers.
 */
export async function askAI(
  question: string,
  context: HealthLog[] | ChatContext
): Promise<string> {
  const ctx =
    Array.isArray(context)
      ? { logs: context }
      : {
          patient: context.patient,
          medications: context.medications ?? [],
          logs: context.logs ?? [],
        };
  const serialized = serializeForAI(ctx);
  const prompt = `You are a care assistant. Use this patient context to answer questions clearly and safely. Do not give medical advice; encourage talking to a doctor when relevant.

Patient context (JSON):
${JSON.stringify(serialized, null, 2)}

Question: ${question}`;

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart.');
  }
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error('Empty response from AI');
  return text;
}

/** AI-generated alert from Gemini */
export interface AIAlertItem {
  type: 'ai_insight' | 'vitals_trend' | 'medication' | 'general';
  title: string;
  urgency: 'low' | 'medium' | 'high';
  summary: string;
  suggestedAction?: string;
}

/** Ask Gemini to analyze patient data and return alerts it deems necessary. */
export async function generateAIAlerts(ctx: {
  patient: { name: string; conditions: string[]; allergies: string[] };
  medications: { name: string; dose?: string; taken?: boolean }[];
  healthHistory?: { bp: string; glucose: number; mood: string; notes: string; date: string }[];
  recentLogs?: { type: string; notes: string }[];
}): Promise<AIAlertItem[]> {
  if (!apiKey) return [];
  try {
    const payload = JSON.stringify(
      {
        patient: ctx.patient,
        medications: ctx.medications,
        healthHistory: (ctx.healthHistory ?? []).slice(-6),
        recentLogs: (ctx.recentLogs ?? []).slice(-10),
      },
      null,
      2
    );
    const prompt = `You are a care coordinator. Analyze this patient data and output ONLY a JSON array of alerts you deem necessary. Each alert: { "type": "ai_insight"|"vitals_trend"|"medication"|"general", "title": "short headline", "urgency": "low"|"medium"|"high", "summary": "1-2 sentences", "suggestedAction": "optional" }. Return ONLY valid JSON, no markdown. If nothing urgent, return [].

Patient data:
${payload}`;
    const result = await model.generateContent(prompt);
    const text = (result.response.text() ?? '[]').trim().replace(/^```json?\s*/i, '').replace(/\s*```\s*$/i, '');
    return JSON.parse(text || '[]');
  } catch {
    return [];
  }
}
