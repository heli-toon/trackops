import { Alert, ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { createWallet, updateWallet } from "@/services/walletService";

const WalletModal = () => {
  const router = useRouter();
  const { walletId, name: initialName, openingBalanceMinor: initialBalance } =
    useLocalSearchParams<{
      walletId?: string;
      name?: string;
      openingBalanceMinor?: string;
    }>();
  const { user } = useAuth();
  const isEditing = Boolean(walletId);
  const [wallet, setWallet] = useState<WalletType>({
    id: walletId,
    name: initialName ?? "",
    openingBalanceMinor: Number(initialBalance ?? 0),
    balanceMinor: Number(initialBalance ?? 0),
  });
  const [openingBalance, setOpeningBalance] = useState(
    (Number(initialBalance ?? 0) / 100).toFixed(2),
  );
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const name = wallet.name.trim();
    const amount = Number(openingBalance);
    if (!name) {
      Alert.alert("Wallet", "Please enter a wallet name.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("Wallet", "Opening balance must be zero or greater.");
      return;
    }
    if (!user?.uid) return;

    setLoading(true);
    try {
      const input = {
        name,
        openingBalanceMinor: Math.round(amount * 100),
      };
      if (isEditing && walletId) {
        await updateWallet(user.uid, walletId, input);
      } else {
        await createWallet(user.uid, input);
      }
      router.back();
    } catch (error) {
      Alert.alert(
        "Wallet",
        error instanceof Error ? error.message : "Unable to save wallet.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={isEditing ? "Edit Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input
              placeholder="Cash"
              value={wallet.name}
              onChangeText={(name) => setWallet((current) => ({ ...current, name }))}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Opening Balance</Typo>
            <Input
              placeholder="0.00"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="decimal-pad"
            />
            <Typo color={colors.neutral400} size={13}>
              Transactions will be added to or subtracted from this balance.
            </Typo>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Button onPress={onSubmit} style={{ flex: 1 }} loading={loading}>
          <Typo color={colors.black} fontWeight="700">
            {isEditing ? "Save Changes" : "Add Wallet"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
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
  inputContainer: {
    gap: spacingY._10,
  },
});
