import { styled } from "@/web/stitches.config";
import { Link as TLink } from "@tanstack/react-router";

export const Link = styled(TLink, {
  color: "$primary",
  textDecoration: "none",
  "&:hover": {
    color: "$primaryHover",
  },
});
