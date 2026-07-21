import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export default function LoginScreen() {
  const { session, signIn, loading } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <LinearGradient
        colors={theme.backgroundGradient}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator color={theme.primary} />
      </LinearGradient>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Lengkapi data", "Email dan password wajib diisi.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) Alert.alert("Login gagal", error);
  }

  return (
    <LinearGradient colors={theme.backgroundGradient} style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          borderWidth: 1,
          borderRadius: 16,
          padding: 24,
          gap: 12,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "800", color: theme.textPrimary, marginBottom: 4 }}>
          Peminjaman HT
        </Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 12, fontSize: 14 }}>
          Masuk menggunakan akun petugas yang terdaftar.
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.inputPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor: theme.inputBackground,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            borderRadius: 12,
            padding: 14,
            color: theme.inputText,
            fontSize: 15,
          }}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.inputPlaceholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            backgroundColor: theme.inputBackground,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            borderRadius: 12,
            padding: 14,
            color: theme.inputText,
            fontSize: 15,
          }}
        />

        <Pressable
          onPress={handleLogin}
          disabled={submitting}
          style={({ pressed }) => ({
            backgroundColor: theme.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            marginTop: 8,
            opacity: submitting ? 0.6 : pressed ? 0.85 : 1,
          })}
        >
          {submitting ? (
            <ActivityIndicator color={theme.primaryTextOnButton} />
          ) : (
            <Text style={{ color: theme.primaryTextOnButton, fontWeight: "700", fontSize: 16 }}>Masuk</Text>
          )}
        </Pressable>
      </View>
    </LinearGradient>
  );
}
