"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  FiCreditCard,
  FiChevronDown,
  FiGlobe,
  FiHeart,
  FiMinus,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import {
  CURRENCIES,
  useCurrency,
} from "@/components/currency/CurrencyProvider";
import {
  LANGUAGES,
  useLanguage,
} from "@/components/language/LanguageProvider";
import {
  ACTION_NAV_ITEMS,
  CATEGORY_MENU_SECTIONS,
  PRIMARY_NAV_ITEMS,
} from "@/config/navigation";
import type { TranslationKey } from "@/lib/i18n";
import { getCurrentPrice, getVariantSummary } from "@/lib/cart";
import {
  searchLocalProducts,
  searchProducts,
  type BackendProduct,
} from "@/lib/products";
import type { Product } from "@/components/store/ProductDetailClient";
import homePopularProductsData from "@/data/home-popular-products.json";

const SCROLL_HIDE_THRESHOLD = 12;
const SCROLL_IDLE_MS = 220;
const RECENT_SEARCHES_STORAGE_KEY = "sgu-recent-searches";
const MAX_RECENT_SEARCHES = 6;

const getInitialRecentSearches = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
};

const ACTION_ICONS = {
  "/search": FiSearch,
  "/cart": FiShoppingCart,
  "/account": FiUser,
} as const;

const PRIMARY_NAV_LABELS: Record<string, TranslationKey> = {
  "/": "nav.home",
  "/store": "nav.store",
  "/categories": "nav.categories",
  "/contact-us": "nav.contactUs",
};

const ACTION_NAV_LABELS: Record<string, TranslationKey> = {
  "/search": "header.searchLabel",
  "/account": "header.signIn",
  "/cart": "header.cart",
};

const CATEGORY_SECTION_LABELS: Record<string, TranslationKey> = {
  General: "nav.general",
  "By Store": "nav.byStore",
};

const CATEGORY_ITEM_LABELS: Record<string, TranslationKey> = {
  "/store?category=new-arrivals": "nav.newArrivals",
  "/store?category=apparel": "nav.apparel",
  "/store?category=supplies": "nav.supplies",
  "/store?category=gifts": "nav.gifts",
  "/store?store=som": "nav.schoolOfMedicine",
  "/store?store=svm": "nav.schoolOfVeterinaryMedicine",
  "/store?store=campus-living": "nav.campusLiving",
  "/store?store=sgu-essentials": "nav.sguEssentials",
};

const CATEGORY_ITEM_DESCRIPTIONS: Record<string, TranslationKey> = {
  "/store?category=new-arrivals": "nav.newArrivalsDescription",
  "/store?category=apparel": "nav.apparelDescription",
  "/store?category=supplies": "nav.suppliesDescription",
  "/store?category=gifts": "nav.giftsDescription",
  "/store?store=som": "nav.schoolOfMedicineDescription",
  "/store?store=svm": "nav.schoolOfVeterinaryMedicineDescription",
  "/store?store=campus-living": "nav.campusLivingDescription",
  "/store?store=sgu-essentials": "nav.sguEssentialsDescription",
};

const headerLocalProducts = homePopularProductsData as Product[];

const mergeHeaderProducts = (
  primary: BackendProduct[],
  secondary: BackendProduct[],
): BackendProduct[] => {
  const productMap = new Map<string, BackendProduct>();
  for (const product of [...primary, ...secondary]) {
    if (!productMap.has(product.id)) productMap.set(product.id, product);
  }
  return Array.from(productMap.values());
};

const getDisplayPrice = (product: BackendProduct) =>
  product.pricing.salePrice ?? product.pricing.basePrice;

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { selectedLanguageCode, setSelectedLanguageCode, t } = useLanguage();
  const {
    selectedCurrencyCode,
    setSelectedCurrencyCode,
    convertPrice,
    formatPrice,
    formatSelectedAmount,
  } = useCurrency();
  const {
    items,
    itemCount,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    removeItem,
    updateQuantity,
  } = useCart();
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownResults, setDropdownResults] = useState<BackendProduct[]>([]);
  const [isDropdownSearching, setIsDropdownSearching] = useState(false);
  const [debouncedHeaderQuery, setDebouncedHeaderQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(
    getInitialRecentSearches,
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<number | null>(null);
  const searchShellRef = useRef<HTMLDivElement | null>(null);
  const categoriesShellRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const preferencesMenuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isSearchRoute = pathname === "/search";
  const isCategoriesRoute = pathname === "/categories" || pathname === "/store";

  const getPrimaryNavLabel = (href: string, fallback: string) => {
    const key = PRIMARY_NAV_LABELS[href];
    return key ? t(key) : fallback;
  };

  const getActionNavLabel = (href: string, fallback: string) => {
    const key = ACTION_NAV_LABELS[href];
    return key ? t(key) : fallback;
  };

  const getCategorySectionLabel = (fallback: string) => {
    const key = CATEGORY_SECTION_LABELS[fallback];
    return key ? t(key) : fallback;
  };

  const getCategoryItemLabel = (href: string, fallback: string) => {
    const key = CATEGORY_ITEM_LABELS[href];
    return key ? t(key) : fallback;
  };

  const getCategoryItemDescription = (href: string, fallback?: string) => {
    const key = CATEGORY_ITEM_DESCRIPTIONS[href];
    if (!key || !fallback) {
      return fallback;
    }

    return t(key);
  };

  const displayedSubtotal = items.reduce(
    (total, item) =>
      total +
      convertPrice(
        getCurrentPrice(item.pricing) * item.quantity,
        item.pricing.currency,
      ),
    0,
  );

  const persistRecentSearch = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) {
      return;
    }

    setRecentSearches((previous) => {
      const lowercased = value.toLowerCase();
      const next = [
        value,
        ...previous.filter((entry) => entry.toLowerCase() !== lowercased),
      ].slice(0, MAX_RECENT_SEARCHES);

      window.localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(next),
      );

      return next;
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      router.push("/search");
      setIsSearchOpen(false);
      return;
    }

    persistRecentSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  const handleRecentSearchClick = (value: string) => {
    setSearchQuery(value);
    persistRecentSearch(value);
    router.push(`/search?q=${encodeURIComponent(value)}`);
    setIsSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    setIsCategoriesOpen(false);
    setIsMobileCategoriesOpen(false);
    setIsAccountMenuOpen(false);
    router.push("/account");
  };

  const closeDesktopMenus = () => {
    setIsSearchOpen(false);
    setIsCategoriesOpen(false);
    setIsAccountMenuOpen(false);
    setIsPreferencesOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 0) {
        setIsHidden(false);
        lastScrollY.current = 0;
        return;
      }

      if (delta > 0 && currentY > SCROLL_HIDE_THRESHOLD) {
        setIsHidden(true);
      } else if (delta < 0) {
        setIsHidden(false);
      }

      lastScrollY.current = currentY;

      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }

      idleTimer.current = window.setTimeout(() => {
        setIsHidden(false);
      }, SCROLL_IDLE_MS);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen || isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen, isCartOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedHeaderQuery(searchQuery),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const trimmed = debouncedHeaderQuery.trim();
    if (!trimmed) {
      setDropdownResults([]);
      setIsDropdownSearching(false);
      return;
    }

    let isActive = true;
    setIsDropdownSearching(true);

    const localMatches = searchLocalProducts(headerLocalProducts, trimmed, 5);

    searchProducts(trimmed, 5)
      .then((products) => {
        if (isActive) {
          setDropdownResults(
            mergeHeaderProducts(products, localMatches).slice(0, 5),
          );
        }
      })
      .catch(() => {
        if (isActive) {
          setDropdownResults(localMatches.slice(0, 5));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsDropdownSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [debouncedHeaderQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const searchShell = searchShellRef.current;
      if (!searchShell) {
        return;
      }

      const { target } = event;
      if (target instanceof Node && !searchShell.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isCategoriesOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const categoriesShell = categoriesShellRef.current;
      if (!categoriesShell) {
        return;
      }

      const { target } = event;
      if (target instanceof Node && !categoriesShell.contains(target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isCategoriesOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const accountMenu = accountMenuRef.current;
      if (!accountMenu) {
        return;
      }

      const { target } = event;
      if (target instanceof Node && !accountMenu.contains(target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (!isPreferencesOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const preferencesMenu = preferencesMenuRef.current;
      if (!preferencesMenu) {
        return;
      }

      const { target } = event;
      if (target instanceof Node && !preferencesMenu.contains(target)) {
        setIsPreferencesOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isPreferencesOpen]);

  useEffect(() => {
    closeDesktopMenus();
    setIsMobileCategoriesOpen(false);
    closeCart();
  }, [pathname]);

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Global Promo Bar & Utility */}
      <div className="bg-sgu-navy text-white">
        <div className="container-shell flex items-center justify-center py-2">
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-[10px] font-bold leading-relaxed tracking-[0.16em] uppercase sm:gap-2">
            <span>
              {t("header.promo")}
            </span>
            <FiCreditCard
              className="hidden h-4 w-4 text-white sm:block"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>

      <div className="container-shell">
        <div className="flex h-[calc(var(--app-header-height)-32px)] items-center justify-between gap-4">
          <Link
            href="/"
            className="logo-safe-area -m-4 inline-flex focus-visible:rounded-md"
            aria-label={t("header.homeAria")}
            onClick={() => {
              setIsMobileOpen(false);
              closeDesktopMenus();
              setIsMobileCategoriesOpen(false);
            }}
          >
            <Image
              src="/logos/sgu-logo-horizontal-color.png"
              alt="St. George's University logo"
              width={220}
              height={40}
              priority
              className="h-auto w-[180px] sm:w-[220px]"
            />
          </Link>

          <nav
            aria-label="Main navigation"
            className={`hidden items-center gap-7 md:flex transition-[max-width,opacity,transform] duration-300 ease-out ${
              isSearchOpen
                ? "max-w-0 -translate-x-3 opacity-0 pointer-events-none"
                : "max-w-[520px] translate-x-0 opacity-100"
            }`}
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              if (item.href === "/categories") {
                return (
                  <div
                    key={item.href}
                    ref={categoriesShellRef}
                    className="relative"
                  >
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                        isCategoriesOpen || isCategoriesRoute
                          ? "text-sgu-navy"
                          : "text-sgu-gray hover:text-sgu-navy"
                      }`}
                      aria-expanded={isCategoriesOpen}
                      aria-controls="desktop-categories-menu"
                      onClick={() => {
                        setIsCategoriesOpen((previous) => !previous);
                        setIsSearchOpen(false);
                        setIsAccountMenuOpen(false);
                        setIsPreferencesOpen(false);
                      }}
                    >
                      <span>{getPrimaryNavLabel(item.href, item.label)}</span>
                      <FiChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 transition-transform ${
                          isCategoriesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isCategoriesOpen ? (
                        <motion.div
                          id="desktop-categories-menu"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[460px] rounded-lg border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            {CATEGORY_MENU_SECTIONS.map((section) => (
                              <div key={section.label}>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  {getCategorySectionLabel(section.label)}
                                </p>
                                <ul className="mt-2 flex flex-col gap-2">
                                  {section.items.map((entry) => (
                                    <li key={entry.href}>
                                      <Link
                                        href={entry.href}
                                        className="block rounded-md px-2 py-2 transition-colors hover:bg-slate-50"
                                        onClick={() => {
                                          setIsCategoriesOpen(false);
                                          setIsSearchOpen(false);
                                          setIsAccountMenuOpen(false);
                                        }}
                                      >
                                        <p className="text-sm font-semibold text-sgu-navy">
                                          {getCategoryItemLabel(
                                            entry.href,
                                            entry.label,
                                          )}
                                        </p>
                                        {entry.description ? (
                                          <p className="mt-0.5 text-xs text-slate-500">
                                            {getCategoryItemDescription(
                                              entry.href,
                                              entry.description,
                                            )}
                                          </p>
                                        ) : null}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 border-t border-slate-200 pt-3">
                            <Link
                              href="/categories"
                              className="text-sm font-semibold text-sgu-navy hover:text-sgu-turquoise"
                              onClick={() => {
                                setIsCategoriesOpen(false);
                                setIsAccountMenuOpen(false);
                              }}
                            >
                              {t("header.viewAllCategories")}
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-sgu-navy"
                      : "text-sgu-gray hover:text-sgu-navy"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    closeDesktopMenus();
                  }}
                >
                  {getPrimaryNavLabel(item.href, item.label)}
                </Link>
              );
            })}
          </nav>

          <nav
            aria-label="Quick actions"
            className={`hidden items-center gap-2 md:flex transition-[flex-grow] duration-300 ease-out ${isSearchOpen ? "flex-1 justify-end" : "flex-initial"}`}
          >
            <div
              ref={searchShellRef}
              className={`relative transition-[flex-grow,width] duration-300 ease-out ${isSearchOpen ? "flex-1" : "w-auto"}`}
            >
              <motion.form
                onSubmit={handleSearchSubmit}
                animate={{ width: "100%" }}
                className={`inline-flex h-11 items-center overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                  isSearchOpen
                    ? "border-sgu-navy shadow-[0_12px_24px_rgba(30,30,100,0.12)]"
                    : isSearchRoute
                      ? "w-28 border-sgu-navy bg-sgu-navy text-white"
                      : "w-28 border-slate-300 text-sgu-navy hover:border-sgu-navy/50"
                }`}
              >
                <button
                  type="button"
                  className={`inline-flex h-full w-10 items-center justify-center ${
                    isSearchOpen ? "text-sgu-navy" : ""
                  }`}
                  aria-label={t("header.searchOpenAria")}
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsCategoriesOpen(false);
                    setIsAccountMenuOpen(false);
                    setIsPreferencesOpen(false);
                  }}
                >
                  <FiSearch aria-hidden="true" className="h-4 w-4" />
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {isSearchOpen ? (
                    <motion.input
                      key="search-input"
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder={t("header.searchPlaceholder")}
                      className="h-full flex-1 border-0 bg-transparent pr-2 text-sm font-medium text-sgu-navy placeholder:text-slate-400 focus:outline-none"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                    />
                  ) : (
                    <motion.button
                      key="search-label"
                      type="button"
                      className="h-full flex-1 pr-3 text-left text-sm font-semibold"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsCategoriesOpen(false);
                        setIsAccountMenuOpen(false);
                      }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      {t("header.searchLabel")}
                    </motion.button>
                  )}
                </AnimatePresence>

                {isSearchOpen ? (
                  <button
                    type="button"
                    className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={t("header.searchCloseAria")}
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </motion.form>

              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                  >
                    {searchQuery.trim() ? (
                      <>
                        <div className="p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t("header.results")}
                          </p>
                          {isDropdownSearching ? (
                            <p className="mt-2 text-sm text-slate-500">
                              {t("header.searching")}
                            </p>
                          ) : dropdownResults.length > 0 ? (
                            <ul className="mt-2 flex flex-col gap-0.5">
                              {dropdownResults.map((product) => (
                                <li key={product.id}>
                                  <Link
                                    href={`/store/${product.id}`}
                                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                                    onClick={() => {
                                      persistRecentSearch(searchQuery);
                                      setIsSearchOpen(false);
                                    }}
                                  >
                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                                      {product.image ? (
                                        <Image
                                          src={product.image}
                                          alt={product.name}
                                          fill
                                          sizes="40px"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full items-center justify-center text-[10px] font-bold text-slate-300">
                                          SGU
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-sgu-navy">
                                        {product.name}
                                      </p>
                                      {product.category ? (
                                        <p className="truncate text-xs text-slate-500">
                                          {product.category}
                                        </p>
                                      ) : null}
                                    </div>
                                    <p className="ml-2 flex-shrink-0 text-sm font-bold text-sgu-navy">
                                      {formatPrice(
                                        getDisplayPrice(product),
                                        product.pricing.currency,
                                      )}
                                    </p>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">
                              {t("header.noProducts")}
                            </p>
                          )}
                        </div>
                        <div className="border-t border-slate-200 px-3 py-2">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sgu-turquoise transition-colors hover:bg-slate-50"
                            onClick={() => {
                              const query = searchQuery.trim();
                              if (!query) return;
                              persistRecentSearch(query);
                              router.push(
                                `/search?q=${encodeURIComponent(query)}`,
                              );
                              setIsSearchOpen(false);
                            }}
                          >
                            <FiSearch
                              aria-hidden="true"
                              className="h-3.5 w-3.5 flex-shrink-0"
                            />
                            <span>
                              {t("header.seeAllResultsFor")}{" "}
                              <strong>{searchQuery.trim()}</strong>
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t("header.recentSearches")}
                        </p>
                        {recentSearches.length > 0 ? (
                          <ul className="mt-2 flex flex-col gap-1">
                            {recentSearches.map((entry) => (
                              <li key={entry}>
                                <button
                                  type="button"
                                  className="w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-sgu-gray hover:bg-slate-100"
                                  onClick={() => handleRecentSearchClick(entry)}
                                >
                                  {entry}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            {t("header.noRecentSearches")}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {!user ? (
              <div ref={preferencesMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPreferencesOpen((previous) => !previous);
                    setIsSearchOpen(false);
                    setIsCategoriesOpen(false);
                    setIsAccountMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    isPreferencesOpen
                      ? "border-sgu-navy bg-sgu-navy text-white"
                      : "border-slate-300 text-sgu-navy hover:border-sgu-navy/50 hover:bg-slate-50"
                  }`}
                  aria-expanded={isPreferencesOpen}
                  aria-label={t("header.preferences")}
                >
                  <FiGlobe aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t("header.preferences")}
                  </span>
                </button>

                <AnimatePresence>
                  {isPreferencesOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {t("header.currency")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CURRENCIES.map((currency) => (
                          <button
                            key={currency.code}
                            type="button"
                            onClick={() =>
                              setSelectedCurrencyCode(currency.code)
                            }
                            className={`rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                              selectedCurrencyCode === currency.code
                                ? "border-sgu-navy bg-sgu-navy text-white"
                                : "border-slate-300 text-sgu-navy hover:bg-slate-50"
                            }`}
                          >
                            {currency.code}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3">
                        <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <FiGlobe aria-hidden="true" className="h-3.5 w-3.5" />
                          {t("header.language")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {LANGUAGES.map((language) => (
                            <button
                              key={language.code}
                              type="button"
                              onClick={() =>
                                setSelectedLanguageCode(language.code)
                              }
                              className={`rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                                selectedLanguageCode === language.code
                                  ? "border-sgu-navy bg-sgu-navy text-white"
                                  : "border-slate-300 text-sgu-navy hover:bg-slate-50"
                              }`}
                            >
                              {language.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}

            {user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen((previous) => !previous);
                    setIsSearchOpen(false);
                    setIsCategoriesOpen(false);
                    setIsPreferencesOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:border-sgu-navy/50 hover:bg-slate-50"
                  aria-expanded={isAccountMenuOpen}
                  aria-controls="account-dropdown-menu"
                >
                  <FiUser aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.fullName}</span>
                  <FiChevronDown
                    className={`h-4 w-4 transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isAccountMenuOpen ? (
                    <motion.div
                      id="account-dropdown-menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
                    >
                      <div className="border-b border-slate-200 pb-3">
                        <p className="text-sm font-semibold text-sgu-navy">
                          {t("header.signedInAs")}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/account"
                        className="mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:bg-slate-50"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <span>{t("header.viewAccountDetails")}</span>
                        <FiUser aria-hidden="true" className="h-4 w-4" />
                      </Link>

                      <Link
                        href="/wishlist"
                        className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:bg-slate-50"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <span>{t("header.wishlist")}</span>
                        <FiHeart aria-hidden="true" className="h-4 w-4" />
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-sgu-turquoise transition-colors hover:bg-slate-50"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span>{t("header.adminProductsUsers")}</span>
                          <FiSettings aria-hidden="true" className="h-4 w-4" />
                        </Link>
                      )}

                      <div className="mt-2 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {t("header.preferences")}
                        </p>

                        <div className="mt-2">
                          <p className="text-xs font-semibold text-slate-500">
                            {t("header.currency")}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {CURRENCIES.map((currency) => (
                              <button
                                key={currency.code}
                                type="button"
                                onClick={() =>
                                  setSelectedCurrencyCode(currency.code)
                                }
                                className={`rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                                  selectedCurrencyCode === currency.code
                                    ? "border-sgu-navy bg-sgu-navy text-white"
                                    : "border-slate-300 text-sgu-navy hover:bg-white"
                                }`}
                              >
                                {currency.code}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <FiGlobe
                              aria-hidden="true"
                              className="h-3.5 w-3.5"
                            />
                            {t("header.language")}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {LANGUAGES.map((language) => (
                              <button
                                key={language.code}
                                type="button"
                                onClick={() =>
                                  setSelectedLanguageCode(language.code)
                                }
                                className={`rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                                  selectedLanguageCode === language.code
                                    ? "border-sgu-navy bg-sgu-navy text-white"
                                    : "border-slate-300 text-sgu-navy hover:bg-white"
                                }`}
                              >
                                {language.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:bg-slate-50"
                      >
                        <span>{t("header.logout")}</span>
                        <FiLogOut aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:border-sgu-navy/50 hover:bg-slate-50"
                onClick={() => closeDesktopMenus()}
              >
                <FiUser aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">{t("header.signIn")}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                closeDesktopMenus();
                toggleCart();
              }}
              className={`relative inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                isCartOpen
                  ? "border-sgu-navy bg-sgu-navy text-white"
                  : "border-slate-300 text-sgu-navy hover:border-sgu-navy/50 hover:bg-slate-50"
              }`}
              aria-expanded={isCartOpen}
              aria-controls="cart-drawer"
            >
              <FiShoppingCart aria-hidden="true" className="h-4 w-4" />
              <span className="hidden lg:inline">{t("header.cart")}</span>
              {itemCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sgu-orange px-1.5 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-sgu-navy md:hidden"
            aria-label={t("header.toggleNavigationMenu")}
            aria-controls="mobile-menu"
            aria-expanded={isMobileOpen}
            onClick={() => {
              setIsMobileOpen((previous) => !previous);
              setIsSearchOpen(false);
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCartOpen ? (
          <>
            <motion.button
              type="button"
              aria-label={t("header.closeCartDrawerAria")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/35"
              onClick={closeCart}
            />
            <motion.aside
              id="cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-lg font-bold text-sgu-navy">
                    {t("header.yourCart")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {itemCount} {itemCount === 1 ? t("header.item") : t("header.items")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
                  aria-label={t("header.closeCartDrawerAria")}
                >
                  <FiX aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              {items.length > 0 ? (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <ul className="space-y-4">
                      {items.map((item) => (
                        <li
                          key={item.key}
                          className="rounded-xl border border-slate-200 p-3"
                        >
                          <div className="flex gap-3">
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-50">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={item.href}
                                className="line-clamp-2 text-sm font-semibold text-sgu-navy hover:text-sgu-turquoise"
                                onClick={() => {
                                  closeCart();
                                  closeDesktopMenus();
                                }}
                              >
                                {item.name}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.subtitle}
                              </p>
                              {Object.keys(item.variantSelection).length > 0 ? (
                                <p className="mt-1 text-xs text-slate-500">
                                  {getVariantSummary(item.variantSelection)}
                                </p>
                              ) : null}

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-sgu-navy">
                                  {formatPrice(
                                    getCurrentPrice(item.pricing),
                                    item.pricing.currency,
                                  )}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        item.key,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
                                    aria-label={`${t("header.decreaseQuantityFor")} ${item.name}`}
                                  >
                                    <FiMinus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-semibold text-sgu-navy">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        item.key,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
                                    aria-label={`${t("header.increaseQuantityFor")} ${item.name}`}
                                  >
                                    <FiPlus className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.key)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
                                    aria-label={`${t("header.removeFromCart")} ${item.name}`}
                                  >
                                    <FiTrash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-200 bg-white px-5 py-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        {t("header.subtotal")}
                      </span>
                      <span className="text-lg font-black text-sgu-navy">
                        {formatSelectedAmount(displayedSubtotal)}
                      </span>
                    </div>
                    <Link
                      href="/checkout"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-sgu-navy px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sgu-navy/90"
                      onClick={() => {
                        closeCart();
                        closeDesktopMenus();
                        setIsMobileOpen(false);
                      }}
                    >
                      {t("header.goToCheckout")}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <FiShoppingCart className="h-10 w-10 text-slate-300" />
                  <p className="mt-4 text-lg font-bold text-sgu-navy">
                    {t("header.yourCartIsEmpty")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("header.addItemsToGetStarted")}
                  </p>
                  <Link
                    href="/store"
                    className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-sgu-navy transition-colors hover:bg-slate-50"
                    onClick={() => {
                      closeCart();
                      closeDesktopMenus();
                    }}
                  >
                    {t("header.continueShopping")}
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div
        id="mobile-menu"
        className={`border-t border-slate-200 bg-white md:hidden ${
          isMobileOpen ? "block" : "hidden"
        }`}
      >
        <nav
          className="container-shell flex flex-col py-4"
          aria-label="Mobile navigation"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            if (item.href === "/categories") {
              return (
                <div key={item.href} className="rounded-md">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-base font-semibold ${
                      isCategoriesRoute || isMobileCategoriesOpen
                        ? "bg-sgu-light-turquoise text-sgu-navy"
                        : "text-sgu-gray hover:bg-slate-50"
                    }`}
                    aria-expanded={isMobileCategoriesOpen}
                    aria-controls="mobile-categories-menu"
                    onClick={() =>
                      setIsMobileCategoriesOpen((previous) => !previous)
                    }
                  >
                    <span>{getPrimaryNavLabel(item.href, item.label)}</span>
                    <FiChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 transition-transform ${
                        isMobileCategoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileCategoriesOpen ? (
                      <motion.div
                        id="mobile-categories-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden px-3 pb-2"
                      >
                        {CATEGORY_MENU_SECTIONS.map((section) => (
                          <div key={section.label} className="mt-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {getCategorySectionLabel(section.label)}
                            </p>
                            <ul className="mt-1 space-y-1">
                              {section.items.map((entry) => (
                                <li key={entry.href}>
                                  <Link
                                    href={entry.href}
                                    className="block rounded-md px-2 py-2 text-sm font-medium text-sgu-gray hover:bg-slate-50"
                                    onClick={() => {
                                      setIsMobileOpen(false);
                                      setIsMobileCategoriesOpen(false);
                                      setIsSearchOpen(false);
                                      setIsCategoriesOpen(false);
                                    }}
                                  >
                                    {getCategoryItemLabel(
                                      entry.href,
                                      entry.label,
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        <Link
                          href="/categories"
                          className="mt-3 block rounded-md px-2 py-2 text-sm font-semibold text-sgu-navy hover:bg-slate-50"
                          onClick={() => {
                            setIsMobileOpen(false);
                            setIsMobileCategoriesOpen(false);
                            setIsSearchOpen(false);
                            setIsCategoriesOpen(false);
                          }}
                        >
                          {t("header.viewAllCategories")}
                        </Link>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-3 text-base font-semibold ${
                  isActive
                    ? "bg-sgu-light-turquoise text-sgu-navy"
                    : "text-sgu-gray hover:bg-slate-50"
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsSearchOpen(false);
                  setIsCategoriesOpen(false);
                  setIsMobileCategoriesOpen(false);
                }}
              >
                {getPrimaryNavLabel(item.href, item.label)}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm font-semibold text-slate-500">
                {t("header.view")}
              </span>
              <Link
                href="/account"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-sgu-navy transition-colors hover:bg-slate-50"
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsMobileCategoriesOpen(false);
                  closeDesktopMenus();
                }}
              >
                {user ? t("header.accountDetails") : t("header.signIn")}
              </Link>
            </div>

            <div className="px-3 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("header.currency")}
              </p>
              <div className="mt-2 flex gap-2">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => setSelectedCurrencyCode(currency.code)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedCurrencyCode === currency.code
                        ? "border-sgu-navy bg-sgu-navy text-white"
                        : "border-slate-300 text-sgu-navy hover:bg-slate-50"
                    }`}
                  >
                    {currency.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("header.language")}
              </p>
              <div className="mt-2 flex gap-2">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setSelectedLanguageCode(language.code)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedLanguageCode === language.code
                        ? "border-sgu-navy bg-sgu-navy text-white"
                        : "border-slate-300 text-sgu-navy hover:bg-slate-50"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>

            {ACTION_NAV_ITEMS.filter(
              (item) => item.href !== "/account" && item.href !== "/cart",
            ).map((item) => {
              const Icon = ACTION_ICONS[item.href as keyof typeof ACTION_ICONS];
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-semibold ${
                    isActive
                      ? "bg-sgu-light-turquoise text-sgu-navy"
                      : "text-sgu-gray hover:bg-slate-50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsSearchOpen(false);
                    setIsCategoriesOpen(false);
                    setIsMobileCategoriesOpen(false);
                  }}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span>{getActionNavLabel(item.href, item.label)}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setIsMobileOpen(false);
                setIsSearchOpen(false);
                setIsCategoriesOpen(false);
                setIsMobileCategoriesOpen(false);
                openCart();
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-semibold ${
                isCartOpen
                  ? "bg-sgu-light-turquoise text-sgu-navy"
                  : "text-sgu-gray hover:bg-slate-50"
              }`}
            >
              <FiShoppingCart aria-hidden="true" className="h-5 w-5" />
              <span>{t("header.cart")}</span>
              {itemCount > 0 ? (
                <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-sgu-orange px-1.5 py-0.5 text-xs font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-semibold text-sgu-gray hover:bg-slate-50"
              >
                <FiLogOut aria-hidden="true" className="h-5 w-5" />
                <span>{t("header.logout")}</span>
              </button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
