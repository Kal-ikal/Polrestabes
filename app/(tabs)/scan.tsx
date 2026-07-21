import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import type { Asset } from "@/types/database";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();

  if (!permission) {
    return (
      <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={theme.primary} />
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text style={{ textAlign: "center", marginBottom: 20, color: theme.textPrimary, fontSize: 15, lineHeight: 22 }}>
            Aplikasi butuh akses kamera untuk memindai QR Code unit HT.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => ({
              backgroundColor: theme.primary,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              opacity: pressed ? 0.85 : 1,
              width: "100%",
              alignItems: "center",
            })}
          >
            <Text style={{ color: theme.primaryTextOnButton, fontWeight: "700", fontSize: 16 }}>
              Izinkan Kamera
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setErrorMsg(null);

    // `data` diasumsikan berisi `code` unik aset (isi QR Code = assets.code)
    const { data: assetData, error } = await supabase
      .from("assets")
      .select("*")
      .eq("code", data)
      .maybeSingle();

    const asset = assetData as Asset | null;

    setLoading(false);

    if (error || !asset) {
      setErrorMsg("QR Code tidak dikenali. Pastikan stiker aset masih terbaca dengan baik.");
      setTimeout(() => setScanned(false), 1500);
      return;
    }

    router.push(`/asset/${asset.id}`);
    // reset supaya bisa scan lagi setelah kembali ke tab ini
    setTimeout(() => setScanned(false), 1000);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View
        style={{
          position: "absolute",
          bottom: 32,
          left: 24,
          right: 24,
          backgroundColor: theme.isDark ? "rgba(11, 15, 25, 0.85)" : "rgba(15, 23, 42, 0.85)",
          borderColor: theme.cardBorder,
          borderWidth: 1,
          borderRadius: 14,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#F1F5F9", textAlign: "center", fontWeight: "600", fontSize: 14, lineHeight: 20 }}>
          {loading
            ? "Memeriksa data aset..."
            : errorMsg ?? "Arahkan kamera ke stiker QR Code pada unit HT"}
        </Text>
      </View>
    </View>
  );
}
