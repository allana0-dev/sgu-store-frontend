import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

type SectionHeaderProps = {
  title: string;
  ctaHref: string;
  ctaLabel: string;
};

export function SectionHeader({ title, ctaHref, ctaLabel }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-black text-sgu-navy text-center sm:text-left">
        {title}
      </h2>
      <div className="flex justify-center sm:justify-end">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-sgu-navy transition-colors hover:border-sgu-turquoise hover:text-sgu-turquoise"
        >
          {ctaLabel}
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
