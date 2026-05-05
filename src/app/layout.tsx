import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import AiRecommendationsWidget from "@/components/recommendations/AiRecommendationsWidget";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
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
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <AppHeader />
                  <main className="flex-1 pt-(--app-header-height)">
                    {children}
                  </main>
                  <AiRecommendationsWidget />
                  <AppFooter />
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
