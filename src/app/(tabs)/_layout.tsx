import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Activity, Pill, Calendar as CalendarIcon, Bell } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import C from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.onPrimaryContainer,
        tabBarInactiveTintColor: C.onSurface,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Home size={22} color={focused ? C.onPrimaryContainer : C.onSurface} fill={focused ? C.onPrimaryContainer : 'transparent'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Health',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Activity size={22} color={focused ? C.onPrimaryContainer : C.onSurface} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meds"
        options={{
          title: 'Meds',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Pill size={22} color={focused ? C.onPrimaryContainer : C.onSurface} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <CalendarIcon size={22} color={focused ? C.onPrimaryContainer : C.onSurface} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="village"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Bell size={22} color={focused ? C.onPrimaryContainer : C.onSurface} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(252,249,248,0.92)',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#5a4136',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: { borderRadius: 12 },
  tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  iconWrap: {
    width: 44, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: C.primaryContainer,
  },
});
