import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SGU Campus Store",
  description: "St. George's University branded ecommerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <AppHeader />
            <main className="flex-1 pt-[var(--app-header-height)]">
              {children}
            </main>
            <AppFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
