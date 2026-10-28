import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { useFocusEffect, useRouter } from 'expo-router'
import { listTransactions } from '@/services/transactionService'
import { TransactionType } from '@/types'
import { Ionicons } from '@expo/vector-icons'

const Home = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async (isRefresh = false) => {
    if (!uid) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setTransactions(await listTransactions(uid));
    } catch {
      setError("Unable to load transactions. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, [loadTransactions]));

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typo size={28} fontWeight="600">Recent Transactions</Typo>
          <Button onPress={() => router.push("../transaction")} style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.black} />
          </Button>
        </View>
        {loading ? (
          <Typo color={colors.neutral400}>Loading transactions...</Typo>
        ) : error ? (
          <View style={styles.state}>
            <Typo color={colors.rose}>{error}</Typo>
            <Button onPress={() => loadTransactions()} style={styles.retryButton}>
              <Typo color={colors.black}>Retry</Typo>
            </Button>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.state}>
            <Typo color={colors.neutral300}>No transactions yet.</Typo>
            <Typo color={colors.neutral500} size={14}>Add your first income or expense.</Typo>
          </View>
        ) : (
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTransactions(true)} tintColor={colors.primary} />}
            contentContainerStyle={styles.list}
          >
            {transactions.slice(0, 20).map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transaction}
                onPress={() => router.push({ pathname: "../transaction", params: { transactionId: transaction.id } })}
              >
                <View style={styles.transactionInfo}>
                  <Typo fontWeight="500">{transaction.description}</Typo>
                  <Typo color={colors.neutral400} size={14}>{transaction.categoryId}</Typo>
                </View>
                <Typo color={transaction.type === "income" ? colors.primary : colors.rose} fontWeight="600">
                  {transaction.type === "income" ? "+" : "-"}{(transaction.amountMinor / 100).toFixed(2)}
                </Typo>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacingX._20, paddingTop: spacingY._20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacingY._25 },
  addButton: { width: 48, height: 48 },
  list: { gap: spacingY._10, paddingBottom: spacingY._20 },
  transaction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacingY._15, borderRadius: 16, backgroundColor: colors.neutral800 },
  transactionInfo: { gap: spacingY._5, flex: 1 },
  state: { alignItems: "center", gap: spacingY._10, paddingTop: spacingY._50 },
  retryButton: { paddingHorizontal: spacingX._20 },
})