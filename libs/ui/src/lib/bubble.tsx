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
    <div className="border-[1px] bg-background border-gray-300 rounded-lg gap-2 text-xs px-2 py-1 flex items-center bg-opacity-45">
      {color ? (
        <div
          style={{ backgroundColor: color }}
          className="w-2 h-2 rounded-full border-[1px] border-gray-200"
        />
      ) : null}

      {icon}
      <span className="whitespace-nowrap"> {label}</span>
    </div>
  );
};
