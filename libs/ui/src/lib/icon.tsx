export function Icon(props: { icon: React.FC<any> }) {
  return <props.icon className="text-foreground/60" />;
}
