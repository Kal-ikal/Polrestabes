import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { StatusBadge } from "@/components/StatusBadge";
import { canBorrow } from "@/lib/assetStateMachine";
import type { Asset } from "@/types/database";

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAsset(data as Asset | null);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit() {
    if (!asset) return;
    if (!purpose.trim()) {
      Alert.alert("Lengkapi data", "Keperluan peminjaman wajib diisi.");
      return;
    }

    setSubmitting(true);
    // Backend RPC yang menegakkan FSM guard (lihat supabase/schema.sql -> request_borrow)
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + 8); // default estimasi 8 jam, sesuaikan kebutuhan

    const { error } = await supabase.rpc("request_borrow", {
      p_asset_id: asset.id,
      p_purpose: purpose.trim(),
      p_due_at: dueAt.toISOString(),
    });
    setSubmitting(false);

    if (error) {
      Alert.alert("Gagal mengajukan", error.message);
      return;
    }

    Alert.alert("Berhasil", "Pengajuan peminjaman terkirim, menunggu persetujuan admin.", [
      { text: "OK", onPress: () => router.push("/(tabs)") },
    ]);
  }

  if (loading) {
    return (
      <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={theme.primary} />
      </LinearGradient>
    );
  }

  if (!asset) {
    return (
      <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 16 }}>Aset tidak ditemukan.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.textPrimary }}>{asset.name}</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4, fontSize: 14 }}>
            SN: {asset.serial_number}
          </Text>
          <View style={{ marginTop: 12 }}>
            <StatusBadge status={asset.status} />
          </View>
        </View>

        {canBorrow(asset.status) ? (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              borderRadius: 16,
              padding: 20,
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 8, color: theme.textPrimary, fontSize: 15 }}>
              Keperluan Peminjaman
            </Text>
            <TextInput
              placeholder="Contoh: Pengamanan Unras, Patroli Malam, dll"
              placeholderTextColor={theme.inputPlaceholder}
              value={purpose}
              onChangeText={setPurpose}
              multiline
              style={{
                backgroundColor: theme.inputBackground,
                borderWidth: 1,
                borderColor: theme.inputBorder,
                borderRadius: 12,
                padding: 14,
                minHeight: 100,
                textAlignVertical: "top",
                color: theme.inputText,
                fontSize: 15,
              }}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => ({
                backgroundColor: theme.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                marginTop: 20,
                opacity: submitting ? 0.6 : pressed ? 0.85 : 1,
              })}
            >
              {submitting ? (
                <ActivityIndicator color={theme.primaryTextOnButton} />
              ) : (
                <Text style={{ color: theme.primaryTextOnButton, fontWeight: "700", fontSize: 16 }}>
                  Ajukan Peminjaman
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.isDark ? "rgba(153,27,27,0.25)" : "#FEF2F2",
              borderColor: theme.isDark ? "rgba(248,113,113,0.3)" : "#FECACA",
              borderWidth: 1,
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: theme.isDark ? "#F87171" : "#991B1B", fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
              {asset.status === "dipinjam"
                ? "Unit ini sedang dipinjam petugas lain."
                : "Unit ini sedang berstatus rusak dan tidak bisa dipinjam."}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
