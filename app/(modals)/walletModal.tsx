import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ModalWrapper from '@/components/ModalWrapper';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { Image } from 'expo-image';
import { getProfileImage } from '@/services/imageService';
import { Ionicons } from '@expo/vector-icons';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import { WalletType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { updateUser } from '@/userService';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const WalletModal = () => {
  const router = useRouter();
  const {user, updateUserData} = useAuth();
  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    let {name, image} = wallet;
    if (!name.trim()){
      Alert.alert("User", "Please fill all fields");
      return;
    }
    setLoading(true);
    const res = await updateUser(user?.uid as string, wallet)
    setLoading(false);
    if (res.success){
      updateUserData(user?.uid as string);
      router.back();
    }else{
      Alert.alert("User", res.msg);
    }
  }
  const onPickImage = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
    //   setUserData({...userData, image: result.assets[0]});
    }
  }
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title='New Wallet' leftIcon={<BackButton />} style={{marginBottom:spacingY._10}} />
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input placeholder="Salary" value={wallet.name} onChangeText={value=>setWallet({...wallet, name:value})} />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Button onPress={onSubmit} style={{flex:1,}} loading={loading}>
          <Typo color={colors.black} fontWeight={"700"}>Add Wallet</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    // position: "relative",
    // overflow: "hidden",
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingX._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width:0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer : {
    gap: spacingY._10,
  }
})