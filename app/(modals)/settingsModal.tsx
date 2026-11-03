import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import { usePreferences } from "@/contexts/preferencesContext";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

const SettingsModal = () => {
  const { currency, setCurrency } = usePreferences();

  const handleSelectCurrency = async (code: string) => {
    await setCurrency(code);
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Settings"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._15 }}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Typo size={18} fontWeight="600" color={colors.white}>
              Preferred Currency
            </Typo>
            <Typo size={14} color={colors.neutral400}>
              Choose the currency used for transactions, wallets, statistics, and budgets.
            </Typo>

            <View style={styles.currencyList}>
              {SUPPORTED_CURRENCIES.map((item) => {
                const isSelected = item.code === currency;
                return (
                  <TouchableOpacity
                    key={item.code}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.label}`}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.selectedCurrencyItem,
                    ]}
                    onPress={() => handleSelectCurrency(item.code)}
                  >
                    <View style={styles.currencyInfo}>
                      <View style={styles.symbolBadge}>
                        <Typo fontWeight="700" color={isSelected ? colors.black : colors.white}>
                          {item.symbol}
                        </Typo>
                      </View>
                      <View>
                        <Typo
                          fontWeight={isSelected ? "600" : "500"}
                          color={isSelected ? colors.primary : colors.white}
                        >
                          {item.label}
                        </Typo>
                        <Typo size={12} color={colors.neutral400}>
                          {item.code}
                        </Typo>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  content: {
    paddingBottom: spacingY._30,
    gap: spacingY._25,
  },
  section: {
    gap: spacingY._10,
  },
  currencyList: {
    gap: spacingY._10,
    marginTop: spacingY._10,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacingY._15,
    borderRadius: radius._15,
    backgroundColor: colors.neutral800,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  selectedCurrencyItem: {
    borderColor: colors.primary,
    backgroundColor: colors.neutral700,
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  symbolBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neutral600,
    alignItems: "center",
    justifyContent: "center",
  },
});
