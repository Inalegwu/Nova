import { createTheme } from "@kuma-ui/core";

const theme = createTheme({
  colors: {
    black: "#00000",
    primary: {
      "100": "#EF46B1",
      "200": "#EF465D",
      "300": "#EF46B1",
      "400": "#EF46B1",
    },
    danger: {
      "100": "#FF2828",
      "200": "#FF4C4C",
      "300": "#FF7070",
    },
    light: {
      "700": "#FFF4E8",
      "600": "#FFF7EE",
      "500": "#FFF9F2",
      "400": "#FFFBF6",
      "300": "#FFFCFA",
      "200": "#FFFEFC",
      "100": "#FFFFFF",
    },
    dark: {
      "700": "#151413",
      "600": "#3E3B38",
      "500": "#67625D",
      "400": "#8F8A84",
      "300": "#B5B1AD",
      "200": "#DAD8D6",
      "100": "#FFFFFF",
    },
  },
  fonts: {
    body: "Font",
    count: "Count",
  },
  components: {
    Button: {
      defaultProps: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderRadius: 8,
        border: "2px solid",
        borderColor: ["colors.light.400", "colors.dark.300"],
      },
      variants: {
        danger: {
          bg: "colors.danger.100",
          color: "colors.danger.300",
        },
      },
    },
    Link: {
      defaultProps: {
        fontSize: 13,
        color: "colors.black",
        fontFamily: "fonts.body",
      },
      variants: {
        danger: {
          color: "colors.danger.300",
        },
      },
    },
  },
});

type CustomTheme = typeof theme;

declare module "@kuma-ui/core" {
  interface Theme extends CustomTheme {}
}

export default theme;
