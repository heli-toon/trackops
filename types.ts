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
    googleLogin: (
        idToken: string,
        accessToken?: string,
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
export type TransactionKind = "income" | "expense";

export type TransactionType = {
    id?: string;
    type: TransactionKind;
    amountMinor: number;
    categoryId: string;
    description: string;
    date: Date | Timestamp;
    walletId?: string;
    createdAt?: Date | Timestamp;
    updatedAt?: Date | Timestamp;
}
export type WalletType = {
    id?: string;
    name: string;
    image?: any;
    openingBalanceMinor: number;
    balanceMinor: number;
    createdAt?: Date | Timestamp;
    updatedAt?: Date | Timestamp;
}
export type CategoryType = {
    id?: string;
    name: string;
    color?: string;
    icon?: string;
    createdAt?: Date | Timestamp;
    updatedAt?: Date | Timestamp;
}
export type BudgetType = {
    id?: string;
    month: string;
    categoryId: string;
    amountMinor: number;
    createdAt?: Date | Timestamp;
    updatedAt?: Date | Timestamp;
}
export type UserPreferencesType = {
    currency: string;
    locale: string;
    defaultWalletId?: string;
    updatedAt?: Date | Timestamp;
}
export type ResponseType = {
    success: boolean;
    data?: any;
    msg?: string;
}