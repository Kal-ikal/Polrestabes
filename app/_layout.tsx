import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

function StackContent() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.isDark ? "#0B0F19" : "#FFFFFF",
          },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="asset/[id]"
          options={{ headerShown: true, title: "Detail Aset" }}
        />
        <Stack.Screen
          name="return/[id]"
          options={{ headerShown: true, title: "Pengembalian" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackContent />
    </AuthProvider>
  );
}
