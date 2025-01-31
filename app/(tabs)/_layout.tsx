import { StyleSheet} from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import CustomTabs from '@/components/CustomTabs'

const _layout = () => {
  return (
    <Tabs screenOptions={{headerShown: false}} tabBar={CustomTabs}>
      <Tabs.Screen name='index' />
      <Tabs.Screen name='statistics' />
      <Tabs.Screen name='wallet' />
      <Tabs.Screen name='profile' />
    </Tabs>
  )
}

export default _layout

const styles = StyleSheet.create({})