import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useTankStore } from '../store/tankStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LogTestScreen } from '../screens/LogTestScreen';
import { DosingScreen } from '../screens/DosingScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🪸',
    Dosing: '💧',
    History: '📈',
    Settings: '⚙️',
  };
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={tabStyles.iconEmoji}>{icons[label]}</Text>
      <Text style={[tabStyles.iconLabel, focused && tabStyles.iconLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dosing"
        component={DosingScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dosing" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="History" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const hasCompletedOnboarding = useTankStore((s) => s.hasCompletedOnboarding);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        {!hasCompletedOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LogTest"
              component={LogTestScreen}
              options={{
                title: 'Log Test',
                headerBackTitle: 'Back',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{
                title: '',
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 8,
  },
  iconEmoji: {
    fontSize: 22,
  },
  iconLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  iconLabelActive: {
    color: Colors.ocean,
    fontWeight: '700',
  },
});
