import { createStitches } from "@stitches/react";

export const { styled, css, globalCss, theme } = createStitches({
  theme: {
    colors: {
      color50: "#ffffd4",
      color150: "#fff1ae",
      color250: "#ffcb88",
      color350: "#ffa663",
      color450: "#ff803d",
      color550: "#f65a17",
      color650: "#d03400",
      color750: "#ab0f00",
      color850: "#850000",
      color950: "#5f0000",
    },
    fonts: {
      body: "Font",
      number: "Count",
    },
  },
});
