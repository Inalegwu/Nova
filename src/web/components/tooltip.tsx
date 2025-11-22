import { Tooltip as RTooltip } from "radix-ui";

type Props = {
  content: string;
  child: React.ReactNode;
};

export default function Tooltip({ content, child }: Props) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger>{child}</RTooltip.Trigger>
      <RTooltip.Content>{content}</RTooltip.Content>
    </RTooltip.Root>
  );
}
