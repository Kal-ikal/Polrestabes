import { useColorScheme } from "react-native";
import { darkTheme, lightTheme, ThemeColors } from "@/theme/colors";

export function useTheme(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? darkTheme : lightTheme;
}
