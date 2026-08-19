export const metadata = {
  title: 'DroJent Web',
  description: 'Приватный мессенджер',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
