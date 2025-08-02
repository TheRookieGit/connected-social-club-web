import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import DashboardScreen from './screens/DashboardScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ChatScreen from './screens/ChatScreen'
import MatchesScreen from './screens/MatchesScreen'
import ProfileScreen from './screens/ProfileScreen'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
        />
        <Stack.Screen 
          name="Matches" 
          component={MatchesScreen} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


