import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { StatusBadge } from "@/components/StatusBadge";
import type { BorrowTransaction } from "@/types/database";

export default function HomeScreen() {
  const { profile, signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [activeLoans, setActiveLoans] = useState<BorrowTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("borrow_transactions")
      .select("*, asset:assets(*)")
      .eq("status", "disetujui")
      .order("created_at", { ascending: false });
    setActiveLoans((data as BorrowTransaction[]) ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: theme.textPrimary }}>
        Halo, {profile?.full_name ?? "Petugas"}
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4, marginBottom: 16, fontSize: 14 }}>
        HT yang sedang kamu pinjam:
      </Text>

      <FlatList
        data={activeLoans}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              borderRadius: 12,
              padding: 24,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
              Belum ada HT yang sedang dipinjam.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/return/${item.id}`)}
            style={({ pressed }) => ({
              backgroundColor: theme.cardBackground,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              opacity: pressed ? 0.9 : 1,
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            })}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, color: theme.textPrimary }}>
              {item.asset?.name}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 14 }}>
              {item.purpose}
            </Text>
            <View style={{ marginTop: 10 }}>
              <StatusBadge status="dipinjam" />
            </View>
            <Text style={{ color: theme.primary, marginTop: 10, fontSize: 13, fontWeight: "600" }}>
              Ketuk untuk ajukan pengembalian →
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        onPress={signOut}
        style={({ pressed }) => ({
          marginTop: 16,
          alignItems: "center",
          paddingVertical: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: theme.isDark ? "#F87171" : "#DC2626", fontWeight: "600", fontSize: 15 }}>
          Keluar
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
