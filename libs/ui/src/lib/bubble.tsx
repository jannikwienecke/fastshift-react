export const Bubble = ({
  label,
  icon,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  color?: string;
}) => {
  return (
    <div className="border-[1px] border-gray-300 rounded-lg text-xs px-2 py-1 flex items-center gap-2 bg-opacity-45">
      {color ? (
        <div
          style={{ backgroundColor: color }}
          className="w-2 h-2 rounded-full"
        />
      ) : null}

      {icon}
      {label}
    </div>
  );
};
