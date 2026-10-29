import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import {
  deleteWallet,
  listWallets,
  WalletSummary,
} from "@/services/walletService";

const formatAmount = (minor: number) => (minor / 100).toFixed(2);

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid;
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadWallets = useCallback(
    async (isRefresh = false) => {
      if (!uid) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        setWallets(await listWallets(uid));
      } catch {
        setError("Unable to load wallets. Check your connection.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uid],
  );

  useFocusEffect(
    useCallback(() => {
      loadWallets();
    }, [loadWallets]),
  );

  const removeWallet = (wallet: WalletSummary) => {
    if (!wallet.id || !uid) return;
    Alert.alert(
      "Delete wallet?",
      `Delete ${wallet.name}? Wallets with transactions cannot be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWallet(uid, wallet.id as string);
              await loadWallets(true);
            } catch (deleteError) {
              Alert.alert(
                "Wallet",
                deleteError instanceof Error
                  ? deleteError.message
                  : "Unable to delete wallet.",
              );
            }
          },
        },
      ],
    );
  };

  const totalBalance = wallets.reduce(
    (total, wallet) => total + wallet.balanceMinor,
    0,
  );

  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={45} fontWeight="500">
              {formatAmount(totalBalance)}
            </Typo>
            <Typo size={16} color={colors.neutral300}>
              Total Balance
            </Typo>
          </View>
        </View>
        <View style={styles.wallets}>
          <View style={styles.flexRow}>
            <Typo size={20} fontWeight="500">
              My Wallets
            </Typo>
            <TouchableOpacity
              accessibilityLabel="Add wallet"
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <Ionicons
                name="add-circle"
                color={colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>
          {loading ? (
            <Typo color={colors.neutral400}>Loading wallets...</Typo>
          ) : error ? (
            <View style={styles.state}>
              <Typo color={colors.rose}>{error}</Typo>
              <TouchableOpacity onPress={() => loadWallets()}>
                <Typo color={colors.primary}>Retry</Typo>
              </TouchableOpacity>
            </View>
          ) : wallets.length === 0 ? (
            <View style={styles.state}>
              <Typo color={colors.neutral300}>No wallets yet.</Typo>
              <Typo color={colors.neutral500} size={14}>
                Add a wallet to track its balance.
              </Typo>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadWallets(true)}
                  tintColor={colors.primary}
                />
              }
              contentContainerStyle={styles.listStyle}
            >
              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={styles.walletCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(modals)/walletModal",
                      params: {
                        walletId: wallet.id,
                        name: wallet.name,
                        openingBalanceMinor: wallet.openingBalanceMinor,
                      },
                    })
                  }
                  onLongPress={() => removeWallet(wallet)}
                >
                  <View style={styles.walletHeader}>
                    <View style={styles.walletIcon}>
                      <Ionicons name="wallet-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.walletInfo}>
                      <Typo fontWeight="600">{wallet.name}</Typo>
                      <Typo color={colors.neutral400} size={13}>
                        Income {formatAmount(wallet.incomeMinor)} · Expenses{" "}
                        {formatAmount(wallet.expenseMinor)}
                      </Typo>
                    </View>
                    <View style={styles.walletActions}>
                      <Typo fontWeight="600">{formatAmount(wallet.balanceMinor)}</Typo>
                      <TouchableOpacity
                        accessibilityLabel={`Delete ${wallet.name}`}
                        onPress={() => removeWallet(wallet)}
                      >
                        <Ionicons name="trash-outline" size={19} color={colors.rose} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: { paddingVertical: spacingY._15, gap: spacingY._10 },
  walletCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._17,
    padding: spacingY._15,
  },
  walletHeader: { flexDirection: "row", alignItems: "center", gap: spacingX._12 },
  walletIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
  },
  walletInfo: { flex: 1, gap: spacingY._5 },
  walletActions: { alignItems: "flex-end", gap: spacingY._10 },
  state: { alignItems: "center", gap: spacingY._10, paddingTop: spacingY._50 },
});
