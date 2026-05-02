export const theme = {
  colors: {
    primary: {
      navy: "#1e1e64",
    },
    secondary: {
      turquoise: "#00bec8",
      lightTurquoise: "#b2ebee",
      orange: "#ff6400",
    },
    accent: {
      red: "#b30838",
    },
    neutral: {
      gray: "#393939",
      lightGray: "#a9a9a9",
      white: "#ffffff",
      surface: "#f6f8fb",
      border: "#e2e6f0",
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    fontWeights: {
      body: 400,
      heading: 700,
      button: 700,
    },
  },
  spacing: {
    container: "1200px",
    pagePadding: "24px",
    logoSafeArea: "16px",
    cardGap: "24px",
  },
  radius: {
    card: "16px",
    pill: "9999px",
  },
  shadows: {
    card: "0 8px 20px rgba(30, 30, 100, 0.06)",
  },
} as const;
