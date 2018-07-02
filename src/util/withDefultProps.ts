import { ComponentType } from "react";

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export const withDefaultProps = <
  P extends object,
  DP extends Partial<P> = Partial<P>
>(
  defaultProps: DP,
  Cmp: ComponentType<P>
) => {
  type RequiredProps = Omit<P, keyof DP>;
  type Props = Partial<DP> & Required<RequiredProps>;

  Cmp.defaultProps = defaultProps;

  return (Cmp as ComponentType<any>) as ComponentType<Props>;
};
