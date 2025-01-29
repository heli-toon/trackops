import React from "react";
import { TextInput, TextInputProps, TextProps, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native";

export type ScreenWrapperProps ={
    style? : ViewStyle;
    children: React.ReactNode;
    bg? : string;    
}
export type ModalWrapperProps = {
    style? : ViewStyle;
    children: React.ReactNode;
    bg? : string;
}
export type BackButtonProps={iconSize?:number; style?: ViewStyle;}

export interface InputProps extends TextInputProps{
    icon? : React.ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    inputRef? : React.RefObject<TextInput>
}
export interface CustomButtonProps extends TouchableOpacityProps {
    style?: ViewStyle;
    onPress?: () => void;
    loading?: boolean;
    children: React.ReactNode;
}
export type TypoProps = {
    size?: number;
    color?: string;
    fontWeight? : TextStyle['fontWeight'];
    children : any | null;
    style? : TextStyle;
    textProps? : TextProps;
}

// export type AuthContextType = {

// }