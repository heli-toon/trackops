import React from "react";
import { TextInput, TextInputProps, TouchableOpacityProps, ViewStyle } from "react-native";

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
export type BackButtonProps={iconSize?:number}

export interface InputProps extends TextInputProps{
    icon? : React.ReactNode;
    inputRef? : React.RefObject<TextInput>
}
export interface CustomButtonProps extends TouchableOpacityProps {
    style?: ViewStyle;
    onPress?: () => void;
    loading?: boolean;
    children: React.ReactNode;
}


// export type AuthContextType = {

// }