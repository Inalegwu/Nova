import { defineConfig, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno()],
  theme: {
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
  },
});
