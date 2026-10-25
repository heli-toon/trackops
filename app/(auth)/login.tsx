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
import { useAuth } from '@/contexts/authContext'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [googleRequest, , promptGoogleLogin] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
    const {login: loginUser, googleLogin} = useAuth();

    const emailRef = useRef('');
    const passwordRef = useRef('');

    const handleSubmit = async () =>{
        if (!emailRef || !passwordRef){
            Alert.alert('Login', 'Please fill all the fields');
            return;
        }
        setIsLoading(true);
        const res = await loginUser(emailRef.current, passwordRef.current);
        setIsLoading(false);
        if (!res.success){
            Alert.alert("Login", res.msg);
        }
    }
    const handleGoogleLogin = async () => {
        if (!googleRequest) {
            Alert.alert('Google Login', 'Google login is not configured yet.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await promptGoogleLogin();
            if (result.type === 'success' && result.authentication?.idToken) {
                const response = await googleLogin(
                    result.authentication.idToken,
                    result.authentication.accessToken,
                );
                if (!response.success) {
                    Alert.alert('Google Login', response.msg);
                }
            } else if (result.type !== 'dismiss' && result.type !== 'cancel') {
                Alert.alert('Google Login', 'Unable to sign in with Google. Please try again.');
            }
        } catch (error) {
            console.error('Google sign-in failed:', error);
            Alert.alert('Google Login', 'Unable to sign in with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const router = useRouter();
    
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />
                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={'800'}>Hey, </Typo>
                    <Typo size={30} fontWeight={'800'}>Welcome back </Typo>
                </View>
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter}>Login now and start tracking your expenses</Typo>
                    <Input placeholder='Enter your email' icon={<Ionicons size={verticalScale(26)} color={colors.neutral300} name='at' />} onChangeText={value => emailRef.current = value} />
                    <Input placeholder='Enter your password' icon={<Ionicons size={verticalScale(26)} color={colors.neutral300} name='key' />} onChangeText={value => passwordRef.current = value} secureTextEntry />
                    <Typo size={14} color={colors.text} style={{alignSelf:'flex-end'}}>Forgot Password?</Typo>

                    <Button loading={isLoading} onPress={handleSubmit}><Typo color={colors.black} size={21} fontWeight={'700'}>Login</Typo></Button>
                    <Button loading={isLoading} onPress={handleGoogleLogin} style={styles.googleButton}>
                        <Typo color={colors.text} size={18} fontWeight={'700'}>Continue with Google</Typo>
                    </Button>
                </View>
                <View style={styles.footer}>
                    <Typo size={15}>Don't have an account?</Typo>
                    <Pressable onPress={()=>router.navigate('/(auth)/register')}>
                        <Typo size={15} fontWeight={'700'} color={colors.primary}>Sign Up</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Login

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
    googleButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral300,
    },
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