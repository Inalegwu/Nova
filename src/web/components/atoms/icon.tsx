import * as Solar from '@solar-icons/react/ssr';
import { type ComponentProps, type ComponentType, memo } from 'react';

type IconName = Exclude<
  keyof typeof Solar,
  | 'SolarProvider'
  | 'default'
  | 'useSolar'
  | 'SSR'
  | 'solar'
  | 'IconBase'
  | 'category'
>;

type IconWeight = Pick<ComponentProps<typeof Solar.Home>, 'weight'>['weight'];

type IconProps = ComponentType<Omit<typeof Solar.Home, 'ref'>> & {
  name: IconName;
  size?: number;
  weight: IconWeight;
};

export const Icon = memo(({ name, ...props }: IconProps) => {
  const Component = Solar[name] as ComponentType<Omit<IconProps, 'name'>>;

  return <Component {...props} />;
});
