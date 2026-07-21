import { View, Text } from "react-native";
import type { AssetStatus } from "@/types/database";
import { statusLabel } from "@/lib/assetStateMachine";
import { useTheme } from "@/hooks/useTheme";

export function StatusBadge({ status }: { status: AssetStatus }) {
  const theme = useTheme();
  const themeStatus = theme.status[status] ?? theme.status.tersedia;

  return (
    <View
      style={{
        backgroundColor: themeStatus.bg,
        borderColor: themeStatus.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: themeStatus.text, fontWeight: "600", fontSize: 13 }}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}
