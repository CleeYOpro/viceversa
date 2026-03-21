import { GoogleGenerativeAI } from '@google/generative-ai';
import { HealthLog } from '../types';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateInsight(logs: HealthLog[]): Promise<string> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentLogs = logs.filter(log => log.timestamp.toDate() >= thirtyDaysAgo);
  const prompt = `Analyze these care logs and identify patterns: ${JSON.stringify(recentLogs)}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function askAI(question: string, context: HealthLog[]): Promise<string> {
  const prompt = `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
