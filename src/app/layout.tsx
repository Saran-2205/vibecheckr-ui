import type { Metadata } from "next";
import { Rubik } from "next/font/google"; // Beautiful, bouncy, bold game font!
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "VibeCheckr - The Ultimate Compatibility Game",
  description: "Test your vibes in real-time with friends. Gamified compatibility testing!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubik.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col text-center overflow-x-hidden selection:bg-yellow-400 selection:text-black"
        style={{ fontFamily: "'Rubik', sans-serif" }}
      >
        {children}
        <center>
          <footer className="p-4 rounded-2xl font-bold w-full max-w-md relative z-10">
            Made with ❤️ by <a href="https://github.com/Saran-2205">Saran</a>
          </footer>
        </center>

      </body>
    </html>
  );
}
