export type InferViewProps<T> = T extends {
  //   eslint-disable-next-line @typescript-eslint/no-explicit-any
  createScreen: (props: any) => React.ReactNode;
}
  ? React.ComponentProps<React.ComponentProps<T['createScreen']>>
  : never;

export type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};
