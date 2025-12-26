import { styled } from "@/web/stitches.config";

export const Row = styled("div", {
  flexDirection: "row",
  variants: {
    justify: {
      between: {
        justifyContent: "space-between",
      },
    },
    align: {
      center: {
        alignItems: "center",
      },
    },
  },
});
