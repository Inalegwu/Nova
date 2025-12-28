import { styled } from "@/web/stitches.config";

export const Box = styled("div", {
  variants: {
    width: {
      full: {
        width: "100%",
      },
    },
    direction: {
      column: {
        flexDirection: "column",
      },
      row: {
        flexDirection: "row",
      },
    },
    align: {
      center: {
        alignItems: "center",
      },
      start: {
        alignItems: "flex-start",
      },
      end: {
        alignItems: "flex-end",
      },
    },
    justify: {
      between: {
        justifyContent: "space-between",
      },
      around: {
        justifyContent: "space-around",
      },
      event: {
        justifyContent: "space-evenly",
      },
      end: {
        justifyContent: "flex-end",
      },
      start: {
        justifyContent: "flex-start",
      },
    },
    size: {
      window: {
        width: "100%",
        height: "100vh",
      },
    },
  },
});
