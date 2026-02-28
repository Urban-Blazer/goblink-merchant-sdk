export const metadata = {
  title: "goBlink Checkout",
  description: "Accept crypto payments with goBlink",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
