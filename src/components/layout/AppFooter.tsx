"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "@/components/language/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

type FooterLinkItem = {
  labelKey: TranslationKey;
  href: string;
};

const CATEGORIES: FooterLinkItem[] = [
  { labelKey: "footer.textbooks", href: "/categories" },
  { labelKey: "footer.medicalSupplies", href: "/categories" },
  { labelKey: "footer.campusApparel", href: "/categories" },
  { labelKey: "footer.snacksAndDrinks", href: "/categories" },
  { labelKey: "footer.schoolEssentials", href: "/categories" },
];

const SERVICES: FooterLinkItem[] = [
  { labelKey: "footer.pickUp", href: "#" },
  { labelKey: "footer.delivery", href: "#" },
  { labelKey: "footer.accountSignup", href: "/account" },
];

const HELP: FooterLinkItem[] = [
  { labelKey: "footer.returns", href: "#" },
  { labelKey: "footer.trackOrders", href: "#" },
  { labelKey: "footer.contactUs", href: "/contact-us" },
  { labelKey: "footer.feedback", href: "#" },
  { labelKey: "footer.securityFraud", href: "#" },
];

const PAYMENT_METHODS = [
  { src: "/payments/visa.webp", alt: "Visa" },
  { src: "/payments/mastercard.png", alt: "Mastercard" },
  { src: "/payments/paypal.png", alt: "PayPal" },
  { src: "/payments/apple-pay.png", alt: "Apple Pay" },
  { src: "/payments/google-pay.png", alt: "Google Pay" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/StGeorgesU/",
    Icon: FaFacebookF,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/user/StGeorgesU",
    Icon: FaYoutube,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/stgeorgesu/?hl=en",
    Icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/school/st.-george's-university/",
    Icon: FaLinkedinIn,
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-white/90 transition-colors hover:text-white hover:underline hover:decoration-white hover:underline-offset-3"
    >
      {label}
    </Link>
  );
}

function FooterHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-bold tracking-[0.12em] text-sgu-light-turquoise uppercase">
        {title}
      </p>
    </div>
  );
}

export default function AppFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto text-white">
      <div className="bg-sgu-navy">
        <div className="container-shell grid items-center gap-5 py-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-10">
          <Link href="/" aria-label="Go to home page" className="xl:col-span-3">
            <Image
              src="/logos/sgu-logo-horizontal-color-ko.png"
              alt="St. George's University logo"
              width={260}
              height={48}
              className="h-auto w-[220px] sm:w-[260px]"
            />
          </Link>

          <nav
            aria-label="SGU social links"
            className="flex items-center gap-2 md:justify-self-end xl:col-start-4 xl:justify-self-start"
          >
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit SGU on ${label}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-sgu-navy"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 bg-sgu-navy">
        <div className="container-shell grid gap-10 py-10 md:grid-cols-2 xl:grid-cols-4">
          <section>
            <FooterHeading title={t("footer.campus")} />
            <p className="mt-4 text-lg font-semibold text-white">
              St. George&apos;s University
            </p>
            <p className="mt-2 text-sm text-white/85">
              University Centre
              <br />
              Grenada, West Indies
            </p>
            <p className="mt-6 text-xs font-bold tracking-[0.12em] text-sgu-light-turquoise uppercase">
              {t("footer.acceptedPayments")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.alt}
                  className="flex h-10 w-16 items-center justify-center rounded-lg border border-white/30 bg-white p-0.5"
                  title={method.alt}
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={68}
                    height={40}
                    className={`h-8 w-auto object-contain ${
                      method.alt === "Google Pay" ? "p-1.5" : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <FooterHeading title={t("footer.categories")} />
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              {CATEGORIES.map((item) => (
                <li key={item.labelKey}>
                  <FooterLink href={item.href} label={t(item.labelKey)} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <FooterHeading title={t("footer.services")} />
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              {SERVICES.map((item) => (
                <li key={item.labelKey}>
                  <FooterLink href={item.href} label={t(item.labelKey)} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <FooterHeading title={t("footer.help")} />
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              {HELP.map((item) => (
                <li key={item.labelKey}>
                  <FooterLink href={item.href} label={t(item.labelKey)} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="border-t border-white/10 bg-sgu-navy">
        <div className="container-shell flex flex-wrap items-center gap-x-6 gap-y-3 py-6 text-sm">
          <p className="font-semibold text-white/95">
            &copy; {new Date().getFullYear()}
            {" "}St. George&apos;s University
          </p>
          <a
            href="#"
            className="font-semibold text-white/90 hover:text-white hover:underline hover:decoration-white hover:underline-offset-3"
          >
            {t("footer.accessibility")}
          </a>
          <Link
            href="/contact-us"
            className="font-semibold text-white/90 hover:text-white hover:underline hover:decoration-white hover:underline-offset-3"
          >
            {t("footer.contactUs")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
