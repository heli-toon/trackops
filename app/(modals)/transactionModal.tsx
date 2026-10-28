import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { listWallets } from "@/services/walletService";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/services/transactionService";
import { TransactionType, WalletType } from "@/types";
import {
  TransactionFormValues,
  validateTransactionForm,
} from "@/utils/transactionValidation";

const categories = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "bills", label: "Bills" },
  { id: "shopping", label: "Shopping" },
  { id: "health", label: "Health" },
  { id: "other", label: "Other" },
];

const today = () => new Date().toISOString().slice(0, 10);

const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const isEditing = Boolean(transactionId);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [values, setValues] = useState<TransactionFormValues>({
    type: "expense",
    amount: "",
    categoryId: "",
    description: "",
    date: today(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      try {
        const walletData = await listWallets(user.uid);
        setWallets(walletData);
        if (transactionId) {
          const transactions = await listTransactions(user.uid);
          const current = transactions.find((item) => item.id === transactionId);
          if (!current) {
            Alert.alert("Transaction unavailable", "This transaction no longer exists.");
            router.back();
            return;
          }
          setTransaction(current);
          const date =
            current.date instanceof Date
              ? current.date
              : current.date.toDate();
          setValues({
            type: current.type,
            amount: (current.amountMinor / 100).toFixed(2),
            categoryId: current.categoryId,
            description: current.description,
            date: date.toISOString().slice(0, 10),
            walletId: current.walletId,
          });
        }
      } catch {
        Alert.alert("Unable to load", "Check your connection and try again.");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [router, transactionId, user?.uid]);

  const updateValue = (key: keyof TransactionFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const onSubmit = async () => {
    if (!user?.uid) return;
    const result = validateTransactionForm(values);
    setErrors(result.errors);
    if (!result.data) return;

    setLoading(true);
    try {
      if (isEditing && transaction?.id) {
        await updateTransaction(user.uid, transaction.id, result.data);
      } else {
        await createTransaction(user.uid, result.data);
      }
      router.back();
    } catch {
      Alert.alert("Unable to save", "Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    if (!user?.uid || !transaction?.id) return;
    Alert.alert("Delete transaction?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteTransaction(user.uid as string, transaction.id as string);
            router.back();
          } catch {
            Alert.alert("Unable to delete", "Check your connection and try again.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loadingData) {
    return (
      <ModalWrapper>
        <View style={styles.center}>
          <Typo>Loading transaction...</Typo>
        </View>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={isEditing ? "Edit Transaction" : "New Transaction"}
          leftIcon={<BackButton />}
        />
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.typeRow}>
            {(["expense", "income"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateValue("type", type)}
                style={[styles.typeButton, values.type === type && styles.selected]}
              >
                <Typo color={values.type === type ? colors.black : colors.white}>
                  {type === "expense" ? "Expense" : "Income"}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Typo color={colors.neutral200}>Amount</Typo>
            <Input
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={values.amount}
              onChangeText={(value) => updateValue("amount", value)}
            />
            {!!errors.amount && <Typo color={colors.rose} size={13}>{errors.amount}</Typo>}
          </View>
          <View style={styles.field}>
            <Typo color={colors.neutral200}>Description</Typo>
            <Input
              placeholder="What was this for?"
              value={values.description}
              onChangeText={(value) => updateValue("description", value)}
            />
            {!!errors.description && <Typo color={colors.rose} size={13}>{errors.description}</Typo>}
          </View>
          <View style={styles.field}>
            <Typo color={colors.neutral200}>Date (YYYY-MM-DD)</Typo>
            <Input
              placeholder={today()}
              value={values.date}
              onChangeText={(value) => updateValue("date", value)}
            />
            {!!errors.date && <Typo color={colors.rose} size={13}>{errors.date}</Typo>}
          </View>
          <View style={styles.field}>
            <Typo color={colors.neutral200}>Category</Typo>
            <View style={styles.optionRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => updateValue("categoryId", category.id)}
                  style={[styles.option, values.categoryId === category.id && styles.selected]}
                >
                  <Typo size={14} color={values.categoryId === category.id ? colors.black : colors.white}>
                    {category.label}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
            {!!errors.categoryId && <Typo color={colors.rose} size={13}>{errors.categoryId}</Typo>}
          </View>
          <View style={styles.field}>
            <Typo color={colors.neutral200}>Wallet</Typo>
            <View style={styles.optionRow}>
              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  onPress={() => updateValue("walletId", wallet.id || "")}
                  style={[styles.option, values.walletId === wallet.id && styles.selected]}
                >
                  <Typo size={14} color={values.walletId === wallet.id ? colors.black : colors.white}>
                    {wallet.name}
                  </Typo>
                </TouchableOpacity>
              ))}
              {wallets.length === 0 && <Typo color={colors.neutral400} size={14}>No wallets yet</Typo>}
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          {isEditing && (
            <Button onPress={onDelete} style={styles.deleteButton} loading={loading}>
              <Typo color={colors.white} fontWeight="700">Delete</Typo>
            </Button>
          )}
          <Button onPress={onSubmit} style={styles.submitButton} loading={loading}>
            <Typo color={colors.black} fontWeight="700">{isEditing ? "Save Changes" : "Save Transaction"}</Typo>
          </Button>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacingX._20 },
  form: { gap: spacingY._20, paddingVertical: spacingY._20 },
  field: { gap: spacingY._7 },
  typeRow: { flexDirection: "row", gap: spacingX._10 },
  typeButton: { flex: 1, alignItems: "center", padding: spacingY._12, borderRadius: radius._12, backgroundColor: colors.neutral700 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacingX._7 },
  option: { paddingHorizontal: spacingX._12, paddingVertical: spacingY._10, borderRadius: radius._10, backgroundColor: colors.neutral700 },
  selected: { backgroundColor: colors.primary },
  footer: { flexDirection: "row", gap: spacingX._10, borderTopWidth: 1, borderTopColor: colors.neutral700, paddingTop: spacingY._15 },
  submitButton: { flex: 1 },
  deleteButton: { flex: 0.45, backgroundColor: colors.rose },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
