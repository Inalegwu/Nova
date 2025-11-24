import { Tooltip as RTooltip } from "radix-ui";

type Props = {
  content: string;
  children: React.ReactNode;
};

export default function Tooltip({ content, children }: Props) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger>{children}</RTooltip.Trigger>
      <RTooltip.Content>{content}</RTooltip.Content>
    </RTooltip.Root>
  );
}
