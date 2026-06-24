import "./globals.css";

export const metadata = {
  title: "सारथी · Sarathi",
  description: "जीवन की उलझनों में गीता की राह — एक शांत मार्गदर्शक।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
