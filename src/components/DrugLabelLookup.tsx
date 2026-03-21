import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { fetchDrugLabelByName } from '../lib/openfda';
import { getMockDrugLabel } from '../lib/mock/mvpMocks';

export const DrugLabelLookup: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);
  const [source, setSource] = useState<'openfda' | 'mock' | null>(null);

  const onLookup = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setInteractions(null);
    setWarnings(null);
    setMeta(null);
    setSource(null);
    try {
      const live = await fetchDrugLabelByName(q);
      if (live) {
        setInteractions(live.drugInteractions ?? 'No drug interactions section on this label.');
        setWarnings(live.warnings ?? null);
        const names = [...live.brandNames, ...live.genericNames].filter(Boolean).join(', ');
        setMeta(names || q);
        setSource(live.source);
      } else {
        const mock = getMockDrugLabel(q);
        setInteractions(mock.drugInteractions ?? null);
        setWarnings(mock.warnings ?? null);
        setMeta(mock.brandNames.join(', '));
        setSource('mock');
      }
    } catch {
      const mock = getMockDrugLabel(q);
      setInteractions(mock.drugInteractions ?? null);
      setWarnings(mock.warnings ?? null);
      setMeta(mock.brandNames.join(', '));
      setSource('mock');
      setError('Could not reach OpenFDA — showing mock data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
      <Text className="text-[18px] font-bold text-gray-900 mb-2">Drug label (OpenFDA)</Text>
      <Text className="text-[14px] text-gray-600 mb-3">
        SPL label search — interactions & warnings are informational only; not medical advice.
      </Text>
      <View className="flex-row">
        <TextInput
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[16px] min-h-[44px] mr-2"
          placeholder="e.g. aspirin"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          className="bg-[#0B6E4F] px-4 rounded-lg justify-center min-h-[44px]"
          onPress={onLookup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-[16px]">Look up</Text>
          )}
        </TouchableOpacity>
      </View>
      {error && <Text className="text-amber-700 text-[14px] mt-2">{error}</Text>}
      {source && (
        <Text className="text-gray-500 text-[12px] mt-2">
          Source: {source === 'openfda' ? 'openFDA' : 'mock (offline / no match)'}
          {meta ? ` · ${meta}` : ''}
        </Text>
      )}
      {(interactions || warnings) && (
        <ScrollView className="max-h-48 mt-3" nestedScrollEnabled>
          {interactions && (
            <View className="mb-2">
              <Text className="text-[14px] font-semibold text-gray-800">Drug interactions</Text>
              <Text className="text-[14px] text-gray-700 mt-1">{interactions}</Text>
            </View>
          )}
          {warnings && (
            <View>
              <Text className="text-[14px] font-semibold text-gray-800">Warnings</Text>
              <Text className="text-[14px] text-gray-700 mt-1">{warnings}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
