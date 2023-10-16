import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Polaris Fuel",
  description: "Premier Star Atlas Resource Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className={`${inter.className} flex flex-col bg-[#000814] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
