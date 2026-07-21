export type ThemeColors = {
  isDark: boolean;
  backgroundGradient: [string, string, string];
  cardBackground: string;
  cardBorder: string;
  primary: string;
  primaryTextOnButton: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  status: {
    tersedia: {
      bg: string;
      text: string;
      border: string;
    };
    dipinjam: {
      bg: string;
      text: string;
      border: string;
    };
    rusak: {
      bg: string;
      text: string;
      border: string;
    };
  };
  shadowColor: string;
};

export const darkTheme: ThemeColors = {
  isDark: true,
  backgroundGradient: ["#0B0F19", "#111C3A", "#1E3A8A"],
  cardBackground: "rgba(26, 37, 64, 0.85)",
  cardBorder: "#2A3B5C",
  primary: "#3B82F6",
  primaryTextOnButton: "#FFFFFF",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  inputBackground: "rgba(15, 23, 42, 0.6)",
  inputBorder: "#2A3B5C",
  inputText: "#F1F5F9",
  inputPlaceholder: "#64748B",
  status: {
    tersedia: {
      bg: "rgba(22, 101, 52, 0.35)",
      text: "#4ADE80",
      border: "rgba(74, 222, 128, 0.4)",
    },
    dipinjam: {
      bg: "rgba(154, 52, 18, 0.35)",
      text: "#FB923C",
      border: "rgba(251, 146, 60, 0.4)",
    },
    rusak: {
      bg: "rgba(153, 27, 27, 0.35)",
      text: "#F87171",
      border: "rgba(248, 113, 113, 0.4)",
    },
  },
  shadowColor: "#000000",
};

export const lightTheme: ThemeColors = {
  isDark: false,
  backgroundGradient: ["#FFFFFF", "#EFF6FF", "#DBEAFE"],
  cardBackground: "#FFFFFF",
  cardBorder: "#BFDBFE",
  primary: "#2563EB",
  primaryTextOnButton: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  inputBackground: "#FFFFFF",
  inputBorder: "#BFDBFE",
  inputText: "#0F172A",
  inputPlaceholder: "#94A3B8",
  status: {
    tersedia: {
      bg: "#DCFCE7",
      text: "#15803D",
      border: "#86EFAC",
    },
    dipinjam: {
      bg: "#FFEDD5",
      text: "#C2410C",
      border: "#FDBA74",
    },
    rusak: {
      bg: "#FEE2E2",
      text: "#B91C1C",
      border: "#FCA5A5",
    },
  },
  shadowColor: "#64748B",
};
