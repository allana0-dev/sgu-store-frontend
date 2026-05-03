"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

type WishlistHeartButtonProps = {
  productId: string;
  productName: string;
  className?: string;
  iconClassName?: string;
};

export default function WishlistHeartButton({
  productId,
  productName,
  className = "",
  iconClassName = "h-4 w-4",
}: WishlistHeartButtonProps) {
  const { isReady, isAuthenticated, hasProduct, toggleProduct } = useWishlist();
  const [showLoginHint, setShowLoginHint] = useState(false);

  const isWishlisted = hasProduct(productId);

  useEffect(() => {
    if (!showLoginHint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowLoginHint(false);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [showLoginHint]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginHint(true);
      return;
    }

    toggleProduct(productId);
  };

  const showTooltip = !isAuthenticated && showLoginHint;
  const isDisabled = !isReady;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={
          isWishlisted
            ? `Remove ${productName} from wishlist`
            : `Save ${productName} to wishlist`
        }
        title={
          isAuthenticated
            ? "Save to wishlist"
            : "Log in to save products to your wishlist."
        }
        onClick={handleClick}
        disabled={isDisabled}
        className={`${className} ${
          isWishlisted
            ? "border-sgu-red bg-red-50 text-sgu-red"
            : "border-slate-200 bg-white/95 text-sgu-navy"
        } ${isDisabled ? "opacity-60" : ""}`}
      >
        <FiHeart
          className={`${iconClassName} ${isWishlisted ? "fill-current" : ""}`}
        />
      </button>

      {showTooltip ? (
        <div className="pointer-events-none absolute right-0 top-[calc(100%+0.4rem)] z-20 w-44 rounded-md bg-sgu-navy px-2.5 py-2 text-[11px] font-semibold leading-tight text-white shadow-lg">
          Log in to save this product to your wishlist.
        </div>
      ) : null}
    </div>
  );
}
