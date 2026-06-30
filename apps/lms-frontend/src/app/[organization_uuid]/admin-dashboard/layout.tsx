export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-11/12 p-6">{children}</div>
    </div>
  );
}
