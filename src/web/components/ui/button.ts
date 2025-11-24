import { styled } from "@/web/stitches.config";

export const Button = styled("button", {
  backgroundColor: "$primary",
  color: "$white",
  padding: "$2 $4",
  borderRadius: "$md",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",

  "&:hover": {
    backgroundColor: "$primaryHover",
  },
});
