import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const { session, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.backgroundGradient[0] }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.isDark ? "#0B0F19" : "#FFFFFF",
        },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: {
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: theme.isDark ? "#0B0F19" : "#FFFFFF",
          borderTopColor: theme.cardBorder,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Beranda" }} />
      <Tabs.Screen name="scan" options={{ title: "Scan QR" }} />
      <Tabs.Screen name="history" options={{ title: "Riwayat" }} />
    </Tabs>
  );
}
