import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { colors, radius } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Loading from './Loading'
import { CustomButtonProps } from '@/types'

const Button = ({ style, onPress, loading = false, children, ...props } : CustomButtonProps) => {
    if (loading) {
        return (
            <View
                accessible
                accessibilityRole="button"
                accessibilityState={{ busy: true, disabled: true }}
                style={[styles.button, style, {backgroundColor : 'transparent'}]}
            >
                <Loading />
            </View>
        )
    }
    return (
        <TouchableOpacity
            {...props}
            accessibilityRole="button"
            accessibilityState={{ disabled: props.disabled }}
            disabled={props.disabled}
            onPress={onPress}
            style={[styles.button, style]}
        >
            {children}
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius._17,
        borderCurve: 'continuous',
        height: verticalScale(52),
        justifyContent: 'center',
        alignItems: 'center',
    }
})