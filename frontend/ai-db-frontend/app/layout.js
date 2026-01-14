import "./globals.css";

export const metadata = {
  title: "AI DB Assistant",
  description: "Ask database questions using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
