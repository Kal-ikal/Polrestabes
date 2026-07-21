import { useCallback, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import type { BorrowTransaction, BorrowStatus } from "@/types/database";

const STATUS_LABEL: Record<BorrowStatus, string> = {
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui / Sedang Dipinjam",
  ditolak: "Ditolak",
  dikembalikan: "Selesai Dikembalikan",
};

export default function HistoryScreen() {
  const [items, setItems] = useState<BorrowTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const getStatusColor = (status: BorrowStatus) => {
    switch (status) {
      case "menunggu_persetujuan":
        return theme.isDark ? "#FACC15" : "#CA8A04";
      case "disetujui":
        return theme.isDark ? "#FB923C" : "#EA580C";
      case "ditolak":
        return theme.isDark ? "#F87171" : "#DC2626";
      case "dikembalikan":
        return theme.isDark ? "#4ADE80" : "#16A34A";
    }
  };

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("borrow_transactions")
      .select("*, asset:assets(*)")
      .order("created_at", { ascending: false });
    setItems((data as BorrowTransaction[]) ?? []);
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
      <FlatList
        data={items}
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
              Belum ada riwayat peminjaman.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, color: theme.textPrimary }}>
              {item.asset?.name}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 14 }}>
              {item.purpose}
            </Text>
            <Text style={{ color: getStatusColor(item.status), marginTop: 8, fontWeight: "700", fontSize: 13 }}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}
