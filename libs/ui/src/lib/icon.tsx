import * as icons from 'react-icons/fa';

export function Icon({ icon }: { icon: keyof typeof icons }) {
  const Icon = icons[icon];
  return <Icon className="text-foreground/60" />;
}
