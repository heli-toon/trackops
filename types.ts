import { Timestamp } from "firebase/firestore";
import React, { ReactNode } from "react";
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
export type accountOptionType = {
    title: string;
    icon: React.ReactNode;
    bgColor: string;
    routeName? : any;
}
export type UserType = {
    uid? : string;
    email? : string | null;
    name? : string | null
    image?: any;
} | null;
export type UserDataType = {
    name: string;
    image?: any;
}
export type AuthContextType = {
    user: UserType;
    setUser: Function;
    login: (
        email: string,
        password: string,
    ) => Promise <{ success: boolean; msg?: string }>;
    register: (
        email: string,
        password: string,
        name: string,
    ) => Promise <{ success: boolean; msg?: string }>;
    updateUserData: (userId : string) => Promise<void>;
};
export type IconProps = {
    name?: string;
    color?: string;
    size?: number;
    fill?: string;
};
export type HeaderProps = {
    title?: string;
    style?: ViewStyle;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
};
export type TransactionType = {
    id?: string;
    type?: string;
    amount?: number;
    category?: string;
    date: Date | Timestamp | string;
    description?: string;
    image?: any;
    uid?: string; 
}
export type WalletType = {
    id?: string;
    name: string;
    amount?: number;
    totalIncome?: number;
    totalExpenses?: number;
    image: any;
    uid?: string;
    created?: Date;
}
export type ResponseType = {
    success: boolean;
    data?: any;
    msg?: string;
}