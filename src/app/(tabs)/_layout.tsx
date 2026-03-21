import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, Pill, Calendar as CalendarIcon, Users } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B6E4F',
        tabBarInactiveTintColor: '#8AA29E',
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meds"
        options={{
          title: 'Meds',
          tabBarIcon: ({ color }) => <Pill size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <CalendarIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="village"
        options={{
          title: 'Village',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
