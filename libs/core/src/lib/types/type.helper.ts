export type InferViewProps<T> = T extends {
  //   eslint-disable-next-line @typescript-eslint/no-explicit-any
  createScreen: (props: any) => React.ReactNode;
}
  ? React.ComponentProps<React.ComponentProps<T['createScreen']>>
  : never;
