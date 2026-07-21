import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import type { ReturnCondition } from "@/types/database";

export default function ReturnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id = borrow_transactions.id
  const router = useRouter();
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);

  async function handleReturn(condition: ReturnCondition) {
    setSubmitting(true);
    // Backend RPC yang menegakkan FSM guard (lihat supabase/schema.sql -> request_return)
    const { error } = await supabase.rpc("request_return", {
      p_transaction_id: id,
      p_condition: condition,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert("Gagal", error.message);
      return;
    }

    Alert.alert("Berhasil", "Pengembalian tercatat.", [
      { text: "OK", onPress: () => router.push("/(tabs)") },
    ]);
  }

  return (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          borderWidth: 1,
          borderRadius: 16,
          padding: 24,
          gap: 16,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", textAlign: "center", color: theme.textPrimary }}>
          Kondisi unit HT saat dikembalikan?
        </Text>

        <Pressable
          onPress={() => handleReturn("baik")}
          disabled={submitting}
          style={({ pressed }) => ({
            backgroundColor: theme.isDark ? "#16A34A" : "#16A34A",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            opacity: submitting ? 0.6 : pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Kondisi Baik</Text>
        </Pressable>

        <Pressable
          onPress={() => handleReturn("rusak")}
          disabled={submitting}
          style={({ pressed }) => ({
            backgroundColor: theme.isDark ? "#DC2626" : "#DC2626",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            opacity: submitting ? 0.6 : pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Rusak</Text>
        </Pressable>

        {submitting && <ActivityIndicator style={{ marginTop: 8 }} color={theme.primary} />}
      </View>
    </LinearGradient>
  );
}
