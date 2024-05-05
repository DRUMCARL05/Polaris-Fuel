import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Polaris Fuel",
  description: "The perfect market place for star atlas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} use-inria`}>{children}</body>
    </html>
  );
}
