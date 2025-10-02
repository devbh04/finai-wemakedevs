export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <main
        className={`bg-white`}
      >
        {children}
      </main>
  );
}