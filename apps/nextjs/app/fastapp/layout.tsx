import Link from 'next/link';

export default function FastAppLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row pt-2">
      <div className="min-w-[15rem]">
        <div className="flex flex-col gap-2">
          <Link href="/fastApp/tasks">Tasks</Link>
          <Link href="/fastApp/projects">Projects</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
