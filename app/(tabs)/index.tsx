import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { usePreferences } from '@/contexts/preferencesContext'
import { useFocusEffect, useRouter } from 'expo-router'
import { listTransactions } from '@/services/transactionService'
import { listWallets, WalletSummary } from '@/services/walletService'
import { TransactionType } from '@/types'
import { getFirestoreErrorMessage } from '@/utils/firestoreError'
import { Ionicons } from '@expo/vector-icons'
import { verticalScale } from '@/utils/styling'

const Home = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const { format } = usePreferences();

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (isRefresh = false) => {
    if (!uid) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [txData, walletData] = await Promise.all([
        listTransactions(uid),
        listWallets(uid),
      ]);
      setTransactions(txData);
      setWallets(walletData);
    } catch (err) {
      setError(getFirestoreErrorMessage(err, "Unable to load dashboard data. Check your connection."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  // Calculate dynamic dashboard totals
  const totalBalanceMinor = wallets.length > 0
    ? wallets.reduce((total, w) => total + w.balanceMinor, 0)
    : transactions.reduce((total, tx) => total + (tx.type === "income" ? tx.amountMinor : -tx.amountMinor), 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyTransactions = transactions.filter((tx) => {
    const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
    return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
  });

  const monthlyIncomeMinor = monthlyTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amountMinor, 0);

  const monthlyExpenseMinor = monthlyTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amountMinor, 0);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Typo size={14} color={colors.neutral400}>Hello,</Typo>
            <Typo size={24} fontWeight="700">{user?.name || "Welcome back"}</Typo>
          </View>
          <Button
            accessibilityLabel="Add transaction"
            onPress={() => router.push("../transaction")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={colors.black} />
          </Button>
        </View>

        {loading ? (
          <View style={styles.state}>
            <Typo color={colors.neutral400}>Loading dashboard...</Typo>
          </View>
        ) : error ? (
          <View style={styles.state}>
            <Typo color={colors.rose} style={{ textAlign: "center" }}>{error}</Typo>
            <Button onPress={() => loadData()} style={styles.retryButton}>
              <Typo color={colors.black}>Retry</Typo>
            </Button>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={styles.scrollContent}
          >
            {/* Dashboard Balance Cards */}
            <View style={styles.balanceCard}>
              <Typo color={colors.neutral400} size={14} fontWeight="500">
                Total Balance
              </Typo>
              <Typo size={32} fontWeight="700" color={colors.white}>
                {format(totalBalanceMinor)}
              </Typo>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
                      <Ionicons name="arrow-down" size={16} color={colors.primary} />
                    </View>
                    <Typo size={13} color={colors.neutral400}>Income (Month)</Typo>
                  </View>
                  <Typo size={16} fontWeight="600" color={colors.primary}>
                    +{format(monthlyIncomeMinor)}
                  </Typo>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryItem}>
                  <View style={styles.summaryHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: "rgba(244, 63, 94, 0.15)" }]}>
                      <Ionicons name="arrow-up" size={16} color={colors.rose} />
                    </View>
                    <Typo size={13} color={colors.neutral400}>Expenses (Month)</Typo>
                  </View>
                  <Typo size={16} fontWeight="600" color={colors.rose}>
                    -{format(monthlyExpenseMinor)}
                  </Typo>
                </View>
              </View>
            </View>

            {/* Recent Transactions Section */}
            <View style={styles.transactionsHeader}>
              <Typo size={20} fontWeight="600">Recent Transactions</Typo>
              <Typo size={13} color={colors.neutral400}>
                {transactions.length} total
              </Typo>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.neutral500} />
                <Typo color={colors.neutral300}>No transactions yet.</Typo>
                <Typo color={colors.neutral500} size={14}>Add your first income or expense.</Typo>
              </View>
            ) : (
              <View style={styles.list}>
                {transactions.slice(0, 20).map((transaction) => (
                  <TouchableOpacity
                    key={transaction.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${transaction.description} transaction`}
                    style={styles.transaction}
                    onPress={() =>
                      router.push({
                        pathname: "../transaction",
                        params: { transactionId: transaction.id },
                      })
                    }
                  >
                    <View style={styles.transactionInfo}>
                      <Typo fontWeight="500">{transaction.description}</Typo>
                      <Typo color={colors.neutral400} size={13}>{transaction.categoryId}</Typo>
                    </View>
                    <Typo
                      color={transaction.type === "income" ? colors.primary : colors.rose}
                      fontWeight="600"
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {format(transaction.amountMinor)}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacingX._20, paddingTop: spacingY._15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._20,
  },
  addButton: { width: 44, height: 44 },
  scrollContent: { paddingBottom: spacingY._25, gap: spacingY._20 },
  balanceCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    padding: spacingY._20,
    gap: spacingY._10,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacingY._15,
    paddingTop: spacingY._15,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  summaryItem: {
    flex: 1,
    gap: spacingY._5,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: colors.neutral700,
    marginHorizontal: spacingX._15,
  },
  transactionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  list: { gap: spacingY._10 },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacingY._15,
    borderRadius: radius._15,
    backgroundColor: colors.neutral800,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  transactionInfo: { gap: spacingY._5, flex: 1 },
  state: { alignItems: "center", gap: spacingY._10, paddingTop: spacingY._50 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(40),
    gap: spacingY._10,
  },
  retryButton: { paddingHorizontal: spacingX._20 },
});
