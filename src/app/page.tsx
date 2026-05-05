"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import homeCategoriesData from "@/data/home-categories.json";
import { SectionHeader } from "@/components/common/SectionHeader";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/components/store/ProductDetailClient";
import { listProducts, type BackendProduct } from "@/lib/products";
import {
  FiArrowRight,
  FiPackage,
  FiTruck,
  FiShield,
  FiTag,
  FiBox,
} from "react-icons/fi";

type HomeCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
};

const CATEGORIES: HomeCategory[] = homeCategoriesData;

const POPULAR_PRODUCTS_LIMIT = 10;
const FALLBACK_PRODUCT_IMAGE = "/images/heroimage.png";

function mapBackendToHomeProduct(product: BackendProduct): Product {
  const dedupedImages = [product.image, ...(product.images ?? [])]
    .map((image) => image.trim())
    .filter(
      (image, index, allImages) =>
        image.length > 0 && allImages.indexOf(image) === index,
    );
  const image = dedupedImages[0] ?? FALLBACK_PRODUCT_IMAGE;
  const hasInventory = product.inventoryStatus !== "out_of_stock";

  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle || product.category || "Campus essential",
    description: product.description ?? "",
    images: dedupedImages.length > 0 ? dedupedImages : [image],
    image,
    href: product.href || `/store/${product.id}`,
    pricing: product.pricing,
    inventoryStatus: product.inventoryStatus,
    inventoryLabel:
      product.inventoryLabel ||
      (hasInventory ? "In Stock" : "Out of Stock"),
    department: product.department,
    gender: product.gender,
    dietary: product.dietary,
    category: product.category ?? undefined,
    tags: product.tags,
    rating: product.rating ?? undefined,
    reviewCount: product.reviewCount,
    variants: product.variants,
  };
}

export default function Home() {
  return (
    <div className="bg-[#f6f8fb]">
      <main className="space-y-12 pb-20">
        <Hero />
        <CategoryGrid />
        <PopularOnCampus />
        <ValuePropStrip />
        <BottomCTA />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <div className="bg-white border-b border-slate-200">
      <section className="relative min-h-[560px] lg:min-h-[660px] overflow-hidden">
        <Image
          src="/images/heroimage.png"
          alt="SGU campus store essentials"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-110 contrast-105 saturate-110"
        />

        <div className="absolute inset-y-0 left-0 w-full md:w-[70%] lg:w-[58%] bg-gradient-to-r from-[#0f1450]/78 via-[#0f1450]/46 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[56%] lg:w-[44%] bg-gradient-to-r from-[#0b103f]/68 to-transparent" />

        <div className="container-shell relative z-10 flex min-h-[560px] lg:min-h-[660px] items-center py-12 lg:py-16">
          <div className="max-w-2xl space-y-7">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-5xl font-black !text-white leading-tight"
            >
              Everything You Need,
              <br />
              Right Here On Campus
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-white/90 max-w-xl font-medium"
            >
              Shop textbooks, supplies, apparel, and everyday essentials. Pick
              up or get it delivered to your dorm.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/store"
                className="bg-white text-sgu-navy px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-lg"
              >
                Shop Now <FiArrowRight />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/25"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                  <FiPackage />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Pick Up</p>
                  <p className="text-xs text-white/80">Ready in minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                  <FiTruck />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Dorm Delivery</p>
                  <p className="text-xs text-white/80">Fast & reliable</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                  <FiShield />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Secure Checkout
                  </p>
                  <p className="text-xs text-white/80">Safe payments</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryGrid() {
  return (
    <section className="container-shell pt-8">
      <SectionHeader
        title="Shop by Category"
        ctaHref="/categories"
        ctaLabel="See all categories"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={cat.href}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-sgu-turquoise hover:shadow-lg transition-all group"
            >
              <Image
                src={cat.icon}
                alt={`${cat.name} category icon`}
                width={52}
                height={52}
                className="mb-4 group-hover:scale-110 transition-transform"
              />
              <p className="text-sm font-bold text-sgu-navy text-center mb-1">
                {cat.name}
              </p>
              <p className="text-xs text-slate-500 text-center mb-2">
                {cat.description}
              </p>
              <span className="text-[10px] font-black uppercase tracking-widest text-sgu-turquoise opacity-0 group-hover:opacity-100 transition-opacity">
                View all
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PopularOnCampus() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    listProducts(POPULAR_PRODUCTS_LIMIT)
      .then((backendProducts) => {
        if (isActive) {
          setProducts(backendProducts.map(mapBackendToHomeProduct));
        }
      })
      .catch(() => {
        if (isActive) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="container-shell">
      <SectionHeader
        title="Popular on Campus"
        ctaHref="/store"
        ctaLabel="View all products"
      />
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">
            Loading popular products...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-lg font-black text-sgu-navy">
            Products are coming soon
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;re preparing the production catalog for launch.
          </p>
        </div>
      )}
    </section>
  );
}

function ValuePropStrip() {
  const props = [
    {
      title: "Pick Up in Minutes",
      desc: "Order online and pick up at the bookstore.",
      icon: <FiPackage />,
    },
    {
      title: "Dorm Delivery",
      desc: "We deliver right to your door.",
      icon: <FiTruck />,
    },
    {
      title: "Real-time Inventory",
      desc: "See what's in stock before you buy.",
      icon: <FiBox />,
    },
    {
      title: "Secure Payments",
      desc: "Your information is safe with us.",
      icon: <FiShield />,
    },
  ];

  return (
    <section className="container-shell">
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-6 md:px-8 md:py-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {props.map((p, idx) => (
            <div
              key={p.title}
              className={`flex gap-4 ${
                idx > 0 ? "xl:border-l xl:border-slate-200 xl:pl-6" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full border-2 border-sgu-navy/80 flex items-center justify-center text-xl text-sgu-navy shrink-0">
                {p.icon}
              </div>
              <div>
                <p className="font-black text-sgu-navy mb-1">{p.title}</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="container-shell">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[#191d74] via-[#1d237e] to-[#232a89] px-6 py-8 md:px-10 md:py-9 text-white">
        <div className="absolute inset-0">
          <div className="absolute -bottom-28 -left-10 h-56 w-[55%] rounded-[100%] bg-[#0f145f]/45" />
          <div className="absolute -bottom-24 left-[35%] h-52 w-[40%] rounded-[100%] bg-[#0d1253]/55" />
          <div className="absolute -bottom-20 right-0 h-44 w-[38%] rounded-[100%] bg-[#0a0f49]/60" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black mb-2">
              Student Deals Just For You
            </h2>
            <p className="text-white/90 text-lg font-medium">
              Check out weekly specials and exclusive discounts.
            </p>
          </div>

          <Link
            href="/store"
            className="mx-auto md:mx-0 inline-flex items-center gap-3 rounded-xl bg-white px-7 py-3 text-base font-bold text-sgu-navy transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Shop Deals <FiTag className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
