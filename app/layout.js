export const metadata = {
  title: 'DroJent Web',
  description: 'Приватный мессенджер',
  manifest: '/manifest.json', // Это свяжет твой файл манифеста
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DroJent',
  },
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#0b0f19" />
        {/* Скрипт для регистрации Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
