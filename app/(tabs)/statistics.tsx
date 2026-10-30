import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Button from "@/components/Button";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { useFocusEffect } from "expo-router";
import { listTransactions } from "@/services/transactionService";
import {
  calculateStatistics,
  filterTransactionsByDateRange,
  getStatisticsDateRange,
  StatisticsRange,
  TransactionStatistics,
} from "@/services/statisticsService";
import { TransactionType } from "@/types";

const ranges: { label: string; value: StatisticsRange }[] = [
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "previous-month" },
  { label: "All time", value: "all-time" },
];

const formatAmount = (amountMinor: number) => (amountMinor / 100).toFixed(2);

const Statistics = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [range, setRange] = useState<StatisticsRange>("this-month");
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const updateStatistics = useCallback(
    (nextRange: StatisticsRange, nextTransactions = transactions) => {
      const dateRange = getStatisticsDateRange(nextRange);
      const comparisonRange = getStatisticsDateRange(
        nextRange === "this-month" ? "previous-month" : "this-month",
      );
      const comparisonTransactions = filterTransactionsByDateRange(
        nextTransactions,
        comparisonRange,
      );
      setStatistics(
        calculateStatistics(
          nextTransactions,
          dateRange,
          comparisonTransactions,
        ),
      );
    },
    [transactions],
  );

  const loadTransactions = useCallback(
    async (isRefresh = false) => {
      if (!uid) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const nextTransactions = await listTransactions(uid);
        setTransactions(nextTransactions);
        updateStatistics(range, nextTransactions);
      } catch {
        setError("Unable to load statistics. Check your connection.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uid, range, updateStatistics],
  );

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const changeRange = (nextRange: StatisticsRange) => {
    setRange(nextRange);
    updateStatistics(nextRange);
  };

  const maxDailyAmount = Math.max(
    ...(statistics?.dailySpending.map((item) => item.amountMinor) ?? [1]),
    1,
  );

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactions(true)}
            tintColor={colors.primary}
          />
        }
      >
        <Typo size={28} fontWeight="600">
          Statistics
        </Typo>
        <View style={styles.rangeRow}>
          {ranges.map((item) => (
            <Button
              key={item.value}
              onPress={() => changeRange(item.value)}
              style={{
                ...styles.rangeButton,
                ...(range === item.value ? styles.activeRangeButton : {}),
              }}
            >
              <Typo
                size={13}
                color={range === item.value ? colors.black : colors.neutral300}
              >
                {item.label}
              </Typo>
            </Button>
          ))}
        </View>
        {loading ? (
          <Typo color={colors.neutral400}>Loading statistics...</Typo>
        ) : error ? (
          <View style={styles.state}>
            <Typo color={colors.rose}>{error}</Typo>
            <Button onPress={() => loadTransactions()} style={styles.retryButton}>
              <Typo color={colors.black}>Retry</Typo>
            </Button>
          </View>
        ) : !statistics || transactions.length === 0 ? (
          <View style={styles.state}>
            <Typo color={colors.neutral300}>No statistics yet.</Typo>
            <Typo color={colors.neutral500} size={14}>
              Add transactions to see your spending trends.
            </Typo>
          </View>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <SummaryCard
                label="Income"
                amount={statistics.incomeMinor}
                color={colors.primary}
              />
              <SummaryCard
                label="Expenses"
                amount={statistics.expenseMinor}
                color={colors.rose}
              />
              <SummaryCard
                label="Balance change"
                amount={statistics.netMinor}
                color={statistics.netMinor >= 0 ? colors.primary : colors.rose}
              />
              <SummaryCard
                label="Spending change"
                amount={statistics.spendingChangePercent}
                color={colors.neutral300}
                percentage
              />
            </View>
            <Section title="Spending by category">
              {statistics.byCategory.length === 0 ? (
                <Typo color={colors.neutral500}>No expenses in this range.</Typo>
              ) : (
                statistics.byCategory.slice(0, 5).map((item) => (
                  <View key={item.categoryId} style={styles.categoryRow}>
                    <View style={styles.categoryHeading}>
                      <Typo>{item.categoryId}</Typo>
                      <Typo color={colors.neutral400} size={14}>
                        {formatAmount(item.amountMinor)} ({item.percentage.toFixed(0)}%)
                      </Typo>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${item.percentage}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </Section>
            <Section title="Daily spending">
              {statistics.dailySpending.length === 0 ? (
                <Typo color={colors.neutral500}>No expenses in this range.</Typo>
              ) : (
                <View style={styles.chart}>
                  {statistics.dailySpending.map((item) => (
                    <View key={item.date} style={styles.barColumn}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(
                              8,
                              (item.amountMinor / maxDailyAmount) * 120,
                            ),
                          },
                        ]}
                      />
                      <Typo size={10} color={colors.neutral500}>
                        {item.date.slice(8)}
                      </Typo>
                    </View>
                  ))}
                </View>
              )}
            </Section>
            <Section title="Largest expenses">
              {statistics.largestExpenses.length === 0 ? (
                <Typo color={colors.neutral500}>No expenses in this range.</Typo>
              ) : (
                statistics.largestExpenses.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionRow}>
                    <View>
                      <Typo>{transaction.description}</Typo>
                      <Typo color={colors.neutral400} size={13}>
                        {transaction.categoryId}
                      </Typo>
                    </View>
                    <Typo color={colors.rose} fontWeight="600">
                      -{formatAmount(transaction.amountMinor)}
                    </Typo>
                  </View>
                ))
              )}
            </Section>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const SummaryCard = ({
  label,
  amount,
  color,
  percentage = false,
}: {
  label: string;
  amount: number | null;
  color: string;
  percentage?: boolean;
}) => (
  <View style={styles.summaryCard}>
    <Typo color={colors.neutral400} size={13}>
      {label}
    </Typo>
    <Typo color={color} fontWeight="600" size={18}>
      {amount === null
        ? "N/A"
        : `${percentage ? amount.toFixed(0) : formatAmount(amount)}${percentage ? "%" : ""}`}
    </Typo>
  </View>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Typo size={18} fontWeight="600">
      {title}
    </Typo>
    {children}
  </View>
);

export default Statistics;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._40,
    gap: spacingY._20,
  },
  rangeRow: { flexDirection: "row", gap: spacingX._7 },
  rangeButton: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: spacingX._7,
    backgroundColor: colors.neutral800,
  },
  activeRangeButton: { backgroundColor: colors.primary },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacingX._10 },
  summaryCard: {
    width: "48%",
    minHeight: 78,
    justifyContent: "space-between",
    padding: spacingX._12,
    borderRadius: 16,
    backgroundColor: colors.neutral800,
  },
  section: { gap: spacingY._12 },
  categoryRow: { gap: spacingY._5 },
  categoryHeading: { flexDirection: "row", justifyContent: "space-between" },
  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: colors.neutral700,
  },
  progressBar: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  chart: {
    minHeight: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacingX._7,
    padding: spacingX._12,
    borderRadius: 16,
    backgroundColor: colors.neutral800,
  },
  barColumn: { flex: 1, alignItems: "center", gap: spacingY._5 },
  bar: { width: "70%", minHeight: 8, borderRadius: 4, backgroundColor: colors.primary },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacingY._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral800,
  },
  state: { alignItems: "center", gap: spacingY._10, paddingTop: spacingY._50 },
  retryButton: { paddingHorizontal: spacingX._20 },
});
