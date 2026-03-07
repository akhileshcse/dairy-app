import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Droplet, GitBranch, Archive } from 'lucide-react-native';
import { supabase } from './utils/supabase';

// Screen Imports
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import MilkScreen from './screens/MilkScreen';
import LivestockScreen from './screens/LivestockScreen';
import InventoryScreen from './screens/InventoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF6FF' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              if (route.name === 'Home') return <Home color={color} size={size} />;
              if (route.name === 'Milk') return <Droplet color={color} size={size} />;
              if (route.name === 'Livestock') return <GitBranch color={color} size={size} />;
              if (route.name === 'Inventory') return <Archive color={color} size={size} />;
            },
            tabBarActiveTintColor: '#2563eb', // Blue-600 pattern
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
          <Tab.Screen name="Milk" component={MilkScreen} options={{ title: 'Milk Logs' }} />
          <Tab.Screen name="Livestock" component={LivestockScreen} options={{ title: 'Livestock Logs' }} />
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory Log' }} />
        </Tab.Navigator>
      ) : (
        <AuthScreen onAuth={setSession} />
      )}
    </NavigationContainer>
  );
}
