import MainContainer from "@/shared/main-container";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainContainer>
      {children}
    </MainContainer>
  );
}
