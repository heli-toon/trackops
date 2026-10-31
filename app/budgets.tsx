import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { listTransactions } from "@/services/transactionService";
import {
  calculateBudgetStatuses,
  createBudget,
  deleteBudget,
  getMonthKey,
  listBudgets,
  updateBudget,
  BudgetStatus,
} from "@/services/budgetService";
import { BudgetType, TransactionType } from "@/types";

const categories = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "bills", label: "Bills" },
  { id: "shopping", label: "Shopping" },
  { id: "health", label: "Health" },
  { id: "other", label: "Other" },
];

const formatAmount = (amountMinor: number) => (amountMinor / 100).toFixed(2);

const Budgets = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const month = getMonthKey();
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!uid) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const [nextBudgets, nextTransactions] = await Promise.all([
          listBudgets(uid),
          listTransactions(uid),
        ]);
        setBudgets(nextBudgets);
        setTransactions(nextTransactions);
      } catch {
        setError("Unable to load budgets. Check your connection.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uid],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const currentStatuses = calculateBudgetStatuses(budgets, transactions, month);
  const historicalBudgets = budgets.filter((budget) => budget.month !== month);

  const resetForm = () => {
    setSelectedBudget(null);
    setCategoryId("");
    setAmount("");
  };

  const editBudget = (status: BudgetStatus) => {
    setSelectedBudget(status.budget);
    setCategoryId(status.budget.categoryId);
    setAmount(formatAmount(status.budget.amountMinor));
  };

  const save = async () => {
    if (!uid || !categoryId) {
      Alert.alert("Budget", "Choose a category.");
      return;
    }
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Budget", "Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const input = {
        month,
        categoryId,
        amountMinor: Math.round(parsedAmount * 100),
      };
      if (selectedBudget?.id) {
        await updateBudget(uid, selectedBudget.id, input);
      } else {
        const existing = budgets.find(
          (budget) => budget.month === month && budget.categoryId === categoryId,
        );
        if (existing?.id) await updateBudget(uid, existing.id, input);
        else await createBudget(uid, input);
      }
      resetForm();
      await loadData(true);
    } catch {
      Alert.alert("Budget", "Unable to save the budget. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (budget: BudgetType) => {
    if (!uid || !budget.id) return;
    Alert.alert("Delete budget?", `Delete the ${budget.categoryId} budget?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudget(uid, budget.id as string);
            await loadData(true);
          } catch {
            Alert.alert("Budget", "Unable to delete the budget.");
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Budgets" leftIcon={<BackButton />} />
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
            />
          }
        >
          <Typo color={colors.neutral400} size={14}>
            Monthly category limits for {month}
          </Typo>
          <View style={styles.form}>
            <Typo fontWeight="600">
              {selectedBudget ? "Edit budget" : "Add a budget"}
            </Typo>
            <View style={styles.optionRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[
                    styles.option,
                    categoryId === category.id && styles.selected,
                  ]}
                >
                  <Typo
                    size={13}
                    color={categoryId === category.id ? colors.black : colors.white}
                  >
                    {category.label}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              placeholder="Monthly amount"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.formActions}>
              <Button onPress={save} loading={saving} style={styles.saveButton}>
                <Typo color={colors.black} fontWeight="700">
                  {selectedBudget ? "Save Changes" : "Add Budget"}
                </Typo>
              </Button>
              {selectedBudget && (
                <Button onPress={resetForm} style={styles.cancelButton}>
                  <Typo>Cancel</Typo>
                </Button>
              )}
            </View>
          </View>

          {loading ? (
            <Typo color={colors.neutral400}>Loading budgets...</Typo>
          ) : error ? (
            <View style={styles.state}>
              <Typo color={colors.rose}>{error}</Typo>
              <Button onPress={() => loadData()} style={styles.retryButton}>
                <Typo color={colors.black}>Retry</Typo>
              </Button>
            </View>
          ) : (
            <>
              <Typo size={20} fontWeight="600">This month</Typo>
              {currentStatuses.length === 0 ? (
                <Typo color={colors.neutral500}>No budgets set for this month.</Typo>
              ) : (
                currentStatuses.map((status) => (
                  <BudgetCard
                    key={status.budget.id}
                    status={status}
                    onEdit={() => editBudget(status)}
                    onDelete={() => remove(status.budget)}
                  />
                ))
              )}
              {historicalBudgets.length > 0 && (
                <>
                  <Typo size={20} fontWeight="600" style={styles.historyTitle}>
                    Budget history
                  </Typo>
                  {historicalBudgets.map((budget) => (
                    <View key={budget.id} style={styles.historyRow}>
                      <Typo>{budget.month} · {budget.categoryId}</Typo>
                      <Typo color={colors.neutral300}>
                        {formatAmount(budget.amountMinor)}
                      </Typo>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const BudgetCard = ({
  status,
  onEdit,
  onDelete,
}: {
  status: BudgetStatus;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onEdit} onLongPress={onDelete}>
    <View style={styles.cardHeader}>
      <View>
        <Typo fontWeight="600">{status.budget.categoryId}</Typo>
        <Typo color={colors.neutral400} size={13}>
          {formatAmount(status.spentMinor)} of {formatAmount(status.budget.amountMinor)}
        </Typo>
      </View>
      <View style={styles.cardAmount}>
        <Typo color={status.isOverspent ? colors.rose : colors.primary} fontWeight="600">
          {status.isOverspent
            ? `${formatAmount(Math.abs(status.remainingMinor))} over`
            : `${formatAmount(status.remainingMinor)} left`}
        </Typo>
        <Typo color={colors.neutral500} size={12}>Tap to edit · hold to delete</Typo>
      </View>
    </View>
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressBar,
          {
            width: `${Math.min(status.percentage, 100)}%`,
            backgroundColor: status.isOverspent ? colors.rose : colors.primary,
          },
        ]}
      />
    </View>
    {status.isOverspent && (
      <Typo color={colors.rose} size={13}>Overspending warning</Typo>
    )}
  </TouchableOpacity>
);

export default Budgets;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacingX._20 },
  content: { gap: spacingY._15, paddingBottom: spacingY._30 },
  form: {
    gap: spacingY._12,
    padding: spacingX._15,
    backgroundColor: colors.neutral800,
    borderRadius: radius._17,
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacingX._7 },
  option: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
    backgroundColor: colors.neutral700,
  },
  selected: { backgroundColor: colors.primary },
  formActions: { flexDirection: "row", gap: spacingX._10 },
  saveButton: { flex: 1 },
  cancelButton: { flex: 1, backgroundColor: colors.neutral700 },
  card: { gap: spacingY._10, padding: spacingX._15, backgroundColor: colors.neutral800, borderRadius: radius._17 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacingX._10 },
  cardAmount: { alignItems: "flex-end", gap: spacingY._3 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.neutral700, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 4 },
  historyTitle: { marginTop: spacingY._15 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacingX._15,
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
  },
  state: { alignItems: "center", gap: spacingY._10 },
  retryButton: { paddingHorizontal: spacingX._20 },
});
