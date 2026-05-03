import Image from "next/image";
import Link from "next/link";
import homeCategoriesData from "@/data/home-categories.json";

type HomeCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
};

const CATEGORIES: HomeCategory[] = homeCategoriesData;

export default function CategoriesPage() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container-shell">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sgu-navy">Categories</h1>
          <p className="mt-3 text-sgu-gray">
            Browse all campus store departments.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-sgu-turquoise hover:shadow-md"
            >
              <Image
                src={category.icon}
                alt={`${category.name} icon`}
                width={52}
                height={52}
                className="mb-4"
              />
              <p className="text-sm font-bold text-sgu-navy">{category.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
