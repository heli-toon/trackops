import { Alert, Pressable, StyleSheet, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import { Ionicons } from '@expo/vector-icons'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);

    const emailRef = useRef('');
    const passwordRef = useRef('');
    const nameRef = useRef('');

    const handleSubmit = async () =>{
        if (!emailRef || !passwordRef || !nameRef){
            Alert.alert('Register', 'Please fill all the fields');
            return;
        }
        console.log('Email:', emailRef.current)
        console.log('Email:', nameRef.current)
        console.log('Password:', passwordRef.current)
    }

    const router = useRouter();
    
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />
                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={'800'}>Let's</Typo>
                    <Typo size={30} fontWeight={'800'}>Get Started</Typo>
                </View>
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter}>Create an account to start tracking your expenses</Typo>
                    <Input placeholder='Enter your name' icon={<Ionicons size={verticalScale(26)} color={colors.neutral300} name='person' />} onChangeText={value => nameRef.current = value} />
                    <Input placeholder='Enter your email' icon={<Ionicons size={verticalScale(26)} color={colors.neutral300} name='at' />} onChangeText={value => emailRef.current = value} />
                    <Input placeholder='Enter your password' icon={<Ionicons size={verticalScale(26)} color={colors.neutral300} name='key' />} onChangeText={value => passwordRef.current = value} secureTextEntry />
                    <Button loading={isLoading} onPress={handleSubmit}><Typo color={colors.black} size={21} fontWeight={'700'}>Register</Typo></Button>
                </View>
                <View style={styles.footer}>
                    <Typo size={15}>Already have an account?</Typo>
                    <Pressable onPress={()=>router.navigate('/(auth)/login')}>
                        <Typo size={15} fontWeight={'700'} color={colors.primary}>Login</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingY._30,
        paddingHorizontal: spacingX._20,
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: 'bold',
        color: colors.text,
    },
    form: {gap: spacingX._20},
    forgotPassword: {
        textAlign: 'right',
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        textAlign: 'center',
        color: colors.text,
        fontSize: verticalScale(15),
    },
})