import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Oswald, Roboto } from "next/font/google";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700"],
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${oswald.variable} font-roboto antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
