export type NavItem = {
  label: string;
  href: string;
};

export type CategoryMenuItem = {
  label: string;
  href: string;
  description?: string;
};

export type CategoryMenuSection = {
  label: string;
  items: CategoryMenuItem[];
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Store", href: "/store" },
  { label: "Categories", href: "/categories" },
  { label: "Contact Us", href: "/contact-us" },
];

export const ACTION_NAV_ITEMS: NavItem[] = [
  { label: "Search", href: "/search" },
  { label: "Account", href: "/account" },
  { label: "Cart", href: "/cart" },
];

export const CATEGORY_MENU_SECTIONS: CategoryMenuSection[] = [
  {
    label: "General",
    items: [
      {
        label: "New Arrivals",
        href: "/store?category=new-arrivals",
        description: "Latest products and seasonal picks",
      },
      {
        label: "Apparel",
        href: "/store?category=apparel",
        description: "T-shirts, polos, hoodies, and uniforms",
      },
      {
        label: "Supplies",
        href: "/store?category=supplies",
        description: "Study tools and everyday essentials",
      },
      {
        label: "Gifts",
        href: "/store?category=gifts",
        description: "Accessories and SGU-branded extras",
      },
    ],
  },
  {
    label: "By Store",
    items: [
      {
        label: "School of Medicine",
        href: "/store?store=som",
        description: "Program-specific items for SOM",
      },
      {
        label: "School of Veterinary Medicine",
        href: "/store?store=svm",
        description: "Program-specific items for SVM",
      },
      {
        label: "Campus Living",
        href: "/store?store=campus-living",
        description: "Residence and daily-use products",
      },
      {
        label: "SGU Essentials",
        href: "/store?store=sgu-essentials",
        description: "Core branded staples across programs",
      },
    ],
  },
];
