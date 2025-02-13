import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'

const Home = () => {
  const user = useAuth();

  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Home</Typo>

    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})