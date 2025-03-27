// /session/layout.tsx
export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}