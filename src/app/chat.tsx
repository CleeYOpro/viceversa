import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Bot } from 'lucide-react-native';
import { useVillageStore } from '../stores/useVillageStore';
import { useAuthStore } from '../stores/useAuthStore';
import { askAI } from '../lib/gemini';
import { HealthLog } from '../types';
import C from '../constants/colors';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const SUGGESTED = [
  "What should I watch for with dementia?",
  "How do I manage sundowning?",
  "What are signs of medication side effects?",
];

export default function ChatScreen() {
  const router = useRouter();
  const { lovedOne } = useVillageStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: `Hi! I'm your CareSync AI assistant. I can help you with care questions for ${lovedOne?.name ?? 'your patient'}. What would you like to know?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const context = lovedOne
        ? [{ id: 'ctx', type: 'note', notes: `Patient: ${lovedOne.name}, Conditions: ${lovedOne.conditions.join(', ')}, Allergies: ${lovedOne.allergies.join(', ')}`, timestamp: { seconds: 0, nanoseconds: 0 }, authorId: '' } as unknown as HealthLog]
        : [];
      const reply = await askAI(text.trim(), context);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_ai',
        role: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_err',
        role: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={C.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.botAvatar}>
            <Bot size={20} color={C.primaryContainer} />
          </View>
          <View>
            <Text style={styles.headerTitle}>CareSync AI</Text>
            <Text style={styles.headerSub}>Care assistant for {lovedOne?.name ?? 'your patient'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Suggested prompts — only show if just the welcome message */}
        {messages.length === 1 && (
          <View style={styles.suggestedWrap}>
            <Text style={styles.suggestedLabel}>SUGGESTED</Text>
            {SUGGESTED.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestedChip} onPress={() => send(s)}>
                <Text style={styles.suggestedText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
            {msg.role === 'ai' && (
              <View style={styles.aiBubbleAvatar}>
                <Bot size={14} color={C.primaryContainer} />
              </View>
            )}
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>{msg.text}</Text>
              <Text style={[styles.bubbleTime, msg.role === 'user' && styles.bubbleTimeUser]}>{msg.time}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.msgRow}>
            <View style={styles.aiBubbleAvatar}>
              <Bot size={14} color={C.primaryContainer} />
            </View>
            <View style={styles.bubbleAI}>
              <ActivityIndicator size="small" color={C.primaryContainer} />
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about care, medications, symptoms..."
          placeholderTextColor={C.outline}
          multiline
          maxLength={500}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Send size={18} color={input.trim() && !loading ? C.onPrimaryContainer : C.outline} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.surfaceContainerHigh,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primaryContainer + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  headerSub: { fontSize: 12, color: C.onSurfaceVariant, marginTop: 1 },

  suggestedWrap: { marginBottom: 24, gap: 8 },
  suggestedLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: C.onSurfaceVariant, marginBottom: 4 },
  suggestedChip: {
    backgroundColor: C.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  suggestedText: { fontSize: 14, color: C.onSurface, fontWeight: '500' },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiBubbleAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.primaryContainer + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%', borderRadius: 18, padding: 14, gap: 4,
  },
  bubbleAI: {
    backgroundColor: C.surfaceContainerLowest,
    borderBottomLeftRadius: 4,
    shadowColor: '#5a4136', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bubbleUser: {
    backgroundColor: C.primaryContainer,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: C.onSurface, lineHeight: 21 },
  bubbleTextUser: { color: C.onPrimaryContainer },
  bubbleTime: { fontSize: 10, color: C.onSurfaceVariant, alignSelf: 'flex-end' },
  bubbleTimeUser: { color: C.onPrimaryContainer + 'AA' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.surfaceContainerHigh,
  },
  input: {
    flex: 1, backgroundColor: C.surfaceContainerLow,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: C.onSurface, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.surfaceContainerHigh },
});
