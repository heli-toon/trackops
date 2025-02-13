import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/authContext'

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(modals)/profileModal' options={{presentation:"modal"}} />
    </Stack>
  )
}

export default function RootLayout() {
  return  (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}