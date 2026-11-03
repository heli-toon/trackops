import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/authContext'
import { PreferencesProvider } from '@/contexts/preferencesContext'

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(modals)/profileModal' options={{presentation:"modal"}} />
      <Stack.Screen name='(modals)/walletModal' options={{presentation:"modal"}} />
      <Stack.Screen name='(modals)/transactionModal' options={{presentation:"modal"}} />
      <Stack.Screen name='(modals)/settingsModal' options={{presentation:"modal"}} />
      <Stack.Screen name='transaction' options={{presentation:"modal"}} />
      <Stack.Screen name='budgets' options={{presentation:"modal"}} />
    </Stack>
  )
}

export default function RootLayout() {
  return  (
    <AuthProvider>
      <PreferencesProvider>
        <StackLayout />
      </PreferencesProvider>
    </AuthProvider>
  )
}