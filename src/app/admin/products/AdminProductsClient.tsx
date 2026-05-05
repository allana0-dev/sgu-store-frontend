"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  createProduct,
  listAdminProducts,
  updateProduct,
  type AdminProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/admin-products";
import {
  listAdminUsers,
  updateUserRole,
  type AdminUser,
  type UserRole,
} from "@/lib/admin-users";

const EMPTY_FORM = {
  name: "",
  subtitle: "",
  description: "",
  category: "",
  customCategory: "",
  tags: "",
  image: "",
  basePrice: "",
  rating: "",
  reviewCount: "",
  inventory: "",
  inStock: true,
  isActive: true,
};

type FormState = typeof EMPTY_FORM;

const CUSTOM_CATEGORY_VALUE = "__custom__";

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "books", label: "Books" },
  { value: "supplies", label: "Supplies" },
  { value: "apparel", label: "Apparel" },
  { value: "snacks", label: "Snacks" },
  { value: "essentials", label: "Essentials" },
  { value: "tech", label: "Tech" },
];

const DEFAULT_TAG_OPTIONS = [
  "textbook",
  "medicine",
  "core",
  "bag",
  "merch",
  "essentials",
  "drinkware",
  "snack",
  "energy",
  "grocery",
  "supplies",
  "notes",
  "study",
  "hygiene",
  "pads",
  "protein",
  "vegan",
  "gluten-free",
  "non-gmo",
];

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function parseTagList(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueLowerCased(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function getCurrentPrice(product: AdminProduct) {
  return product.pricing.salePrice ?? product.pricing.basePrice;
}

function getInventoryStatus(inStock: boolean, inventory: number) {
  if (!inStock || inventory <= 0) {
    return "out_of_stock" as const;
  }

  if (inventory <= 5) {
    return "low_stock" as const;
  }

  return "in_stock" as const;
}

function getInventoryLabel(status: ReturnType<typeof getInventoryStatus>) {
  if (status === "out_of_stock") {
    return "Out of Stock";
  }

  if (status === "low_stock") {
    return "Low Stock";
  }

  return "In Stock";
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-sgu-red">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-sm font-semibold text-sgu-navy"
    >
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-sgu-turquoise" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-sgu-navy placeholder:text-slate-400 focus:border-sgu-turquoise focus:outline-none transition-colors";

export default function AdminProductsClient() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleDraftById, setRoleDraftById] = useState<Record<number, UserRole>>(
    {},
  );
  const [savingRoleUserId, setSavingRoleUserId] = useState<number | null>(null);
  const [userSaveError, setUserSaveError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const categoryOptions = useMemo(() => {
    const options = new Map<string, string>(
      DEFAULT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
    );

    products.forEach((product) => {
      const category = product.category?.trim();
      if (!category || options.has(category)) return;
      options.set(category, titleCase(category));
    });

    return Array.from(options.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [products]);

  const tagOptions = useMemo(() => {
    const fromProducts = products.flatMap((product) => product.tags);
    const merged = uniqueLowerCased([...DEFAULT_TAG_OPTIONS, ...fromProducts]);
    return merged.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listAdminProducts(200, token);
      setProducts(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersLoadError(null);
    setUserSaveError(null);
    try {
      const data = await listAdminUsers(250, token);
      setUsers(data);
      setRoleDraftById(
        Object.fromEntries(data.map((entry) => [entry.id, entry.role])),
      );
    } catch (err) {
      setUsersLoadError(
        err instanceof Error ? err.message : "Failed to load users.",
      );
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthLoading) return;

    const timer = window.setTimeout(() => {
      void loadProducts();
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts, loadUsers, isAuthLoading]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTagDraft("");
    setSaveError(null);
    setImageError(false);
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    const rawCategory = product.category?.trim() ?? "";
    const usesCustomCategory =
      rawCategory.length > 0 &&
      !categoryOptions.some((option) => option.value === rawCategory);

    setEditingId(product.id);
    setForm({
      name: product.name,
      subtitle: product.subtitle ?? "",
      description: product.description ?? "",
      category: usesCustomCategory ? CUSTOM_CATEGORY_VALUE : rawCategory,
      customCategory: usesCustomCategory ? rawCategory : "",
      tags: product.tags.join(", "),
      image: product.image ?? "",
      basePrice: String(product.pricing.basePrice),
      rating: product.rating !== null ? String(product.rating) : "",
      reviewCount: String(product.reviewCount),
      inventory: String(product.inventory),
      inStock: product.inventoryStatus !== "out_of_stock",
      isActive: product.isActive,
    });
    setTagDraft("");
    setSaveError(null);
    setImageError(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTagDraft("");
    setSaveError(null);
    setImageError(false);
  };

  const handleFieldChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "image") setImageError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const tagsArray = uniqueLowerCased(parseTagList(form.tags));
    const resolvedCategory =
      form.category === CUSTOM_CATEGORY_VALUE
        ? form.customCategory.trim()
        : form.category.trim();

    if (form.category === CUSTOM_CATEGORY_VALUE && !resolvedCategory) {
      setSaveError("Enter a custom category or pick one from the list.");
      setSaving(false);
      return;
    }

    try {
      const parsedBasePrice = form.basePrice ? parseFloat(form.basePrice) : NaN;
      const parsedInventory = form.inventory ? parseInt(form.inventory, 10) : 0;
      const inventoryStatus = getInventoryStatus(form.inStock, parsedInventory);
      const inventoryLabel = getInventoryLabel(inventoryStatus);
      const primaryImage = form.image.trim();

      if (!editingId && !primaryImage) {
        setSaveError("Image URL is required.");
        setSaving(false);
        return;
      }

      if (!editingId && Number.isNaN(parsedBasePrice)) {
        setSaveError("Price is required.");
        setSaving(false);
        return;
      }

      if (editingId) {
        const payload: UpdateProductPayload = {
          name: form.name || undefined,
          subtitle: form.subtitle || undefined,
          description: form.description || undefined,
          category: resolvedCategory || undefined,
          tags: tagsArray,
          image: primaryImage || undefined,
          images: primaryImage ? [primaryImage] : undefined,
          pricing: form.basePrice
            ? {
                basePrice: parsedBasePrice,
              }
            : undefined,
          inventoryStatus,
          inventoryLabel,
          department: resolvedCategory
            ? titleCase(resolvedCategory)
            : undefined,
          rating: form.rating ? parseFloat(form.rating) : undefined,
          reviewCount: form.reviewCount
            ? parseInt(form.reviewCount, 10)
            : undefined,
          inventory: form.inventory ? parsedInventory : undefined,
          isActive: form.isActive,
        };
        const updated = await updateProduct(token, editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        );
        setSuccessMessage(`"${updated.name}" updated successfully.`);
      } else {
        const payload: CreateProductPayload = {
          name: form.name,
          subtitle: form.subtitle || form.name,
          description: form.description || undefined,
          category: resolvedCategory || undefined,
          tags: tagsArray,
          image: primaryImage,
          images: [primaryImage],
          href: `/store/${crypto.randomUUID()}`,
          pricing: {
            currency: "USD",
            basePrice: parsedBasePrice,
            salePrice: null,
            compareAtPrice: null,
          },
          inventoryStatus,
          inventoryLabel,
          department: resolvedCategory
            ? titleCase(resolvedCategory)
            : "General",
          gender: "unisex",
          dietary: null,
          variants: null,
          rating: form.rating ? parseFloat(form.rating) : undefined,
          reviewCount: form.reviewCount ? parseInt(form.reviewCount, 10) : 0,
          inventory: parsedInventory,
          isActive: form.isActive,
        };
        const created = await createProduct(token, payload);
        setProducts((prev) => [created, ...prev]);
        setSuccessMessage(`"${created.name}" created successfully.`);
      }
      closeModal();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addSuggestedTag = (nextTag: string) => {
    const current = parseTagList(form.tags);
    const merged = uniqueLowerCased([...current, nextTag]);
    handleFieldChange("tags", merged.join(", "));
  };

  const removeTag = (tagToRemove: string) => {
    const current = parseTagList(form.tags);
    const filtered = current.filter(
      (tag) => tag.toLowerCase() !== tagToRemove.toLowerCase(),
    );
    handleFieldChange("tags", filtered.join(", "));
  };

  const selectedTags = parseTagList(form.tags);
  const availableTagOptions = tagOptions.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.toLowerCase() === tag),
  );

  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.category?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const inStockCount = products.filter(
    (p) => p.inventoryStatus !== "out_of_stock",
  ).length;
  const outOfStockCount = products.filter(
    (p) => p.inventoryStatus === "out_of_stock",
  ).length;
  const filteredUsers = users.filter((entry) => {
    if (!userSearchQuery) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      String(entry.id).includes(query) ||
      entry.fullName.toLowerCase().includes(query) ||
      entry.email.toLowerCase().includes(query) ||
      entry.role.toLowerCase().includes(query)
    );
  });
  const totalUsers = users.length;
  const adminUsersCount = users.filter(
    (entry) => entry.role === "ADMIN",
  ).length;
  const customerUsersCount = users.filter(
    (entry) => entry.role === "CUSTOMER",
  ).length;
  const isRefreshing = isLoading || usersLoading;

  const handleRefreshAll = async () => {
    await Promise.all([loadProducts(), loadUsers()]);
  };

  const handleRoleDraftChange = (id: number, nextRole: UserRole) => {
    setRoleDraftById((previous) => ({ ...previous, [id]: nextRole }));
    setUserSaveError(null);
  };

  const handleRoleSave = async (entry: AdminUser) => {
    const nextRole = roleDraftById[entry.id];
    if (!nextRole || nextRole === entry.role) return;

    setSavingRoleUserId(entry.id);
    setUserSaveError(null);
    try {
      const updated = await updateUserRole(entry.id, nextRole, token);
      setUsers((previous) =>
        previous.map((existing) =>
          existing.id === updated.id ? { ...existing, ...updated } : existing,
        ),
      );
      setRoleDraftById((previous) => ({
        ...previous,
        [updated.id]: updated.role,
      }));
      setSuccessMessage(
        `Role updated: ${updated.fullName} is now ${updated.role}.`,
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setUserSaveError(
        error instanceof Error ? error.message : "Failed to update role.",
      );
    } finally {
      setSavingRoleUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      <div className="container-shell py-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
              Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sgu-navy">
              Products & Users
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              School project mode: this page can be used without logging in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleRefreshAll()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-sgu-navy transition-colors hover:border-sgu-navy disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh All
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
            >
              <FiPlus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <FiCheck className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Products",
              value: totalCount,
              color: "text-sgu-navy",
            },
            { label: "Active", value: activeCount, color: "text-emerald-600" },
            {
              label: "In Stock",
              value: inStockCount,
              color: "text-sgu-turquoise",
            },
            {
              label: "Out of Stock",
              value: outOfStockCount,
              color: "text-sgu-red",
            },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-1 text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, or category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-sgu-turquoise focus:outline-none"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Table / States */}
        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-sm font-semibold text-slate-500">
              Loading products…
            </p>
          </div>
        ) : loadError ? (
          <div className="card-surface p-10 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-sgu-red" />
            <p className="mt-3 text-sm font-semibold text-sgu-red">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="button-primary mt-4 rounded-xl px-4 py-2 text-sm"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-lg font-bold text-sgu-navy">
              {searchQuery
                ? "No products match your search"
                : "No products yet"}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateModal}
                className="button-primary mt-4 rounded-xl px-5 py-2.5 text-sm"
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {[
                      { label: "Product", align: "left" },
                      { label: "ID", align: "left" },
                      { label: "Category", align: "left" },
                      { label: "Price", align: "right" },
                      { label: "Rating", align: "right" },
                      { label: "Reviews", align: "right" },
                      { label: "Inventory", align: "right" },
                      { label: "Stock", align: "center" },
                      { label: "Active", align: "center" },
                      { label: "Actions", align: "center" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`px-4 py-3 text-${col.align} text-[11px] font-bold uppercase tracking-wide text-slate-400`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <FiPackage className="h-4 w-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <span className="max-w-[180px] truncate font-semibold text-sgu-navy">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {product.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.category ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sgu-navy">
                        {formatPrice(getCurrentPrice(product))}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {product.rating !== null ? (
                          `${product.rating} ★`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {product.reviewCount}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {product.inventory}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            product.inventoryStatus !== "out_of_stock"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-sgu-red"
                          }`}
                        >
                          {product.inventoryStatus !== "out_of_stock" ? (
                            <FiCheckCircle className="h-3 w-3" />
                          ) : (
                            <FiXCircle className="h-3 w-3" />
                          )}
                          {product.inventoryStatus === "out_of_stock"
                            ? "Out"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            product.isActive
                              ? "bg-sgu-navy/10 text-sgu-navy"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-sgu-navy transition-colors hover:border-sgu-navy"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400">
                {filtered.length} of {totalCount} product
                {totalCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Users */}
        <div className="mb-8 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
              User Management
            </p>
            <h2 className="mt-1 text-2xl font-bold text-sgu-navy">Users</h2>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={usersLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-sgu-navy transition-colors hover:border-sgu-navy disabled:opacity-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`}
            />
            Refresh Users
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Total Users",
              value: totalUsers,
              color: "text-sgu-navy",
            },
            {
              label: "Admins",
              value: adminUsersCount,
              color: "text-emerald-600",
            },
            {
              label: "Customers",
              value: customerUsersCount,
              color: "text-sgu-turquoise",
            },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-1 text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, email, or role…"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-sgu-turquoise focus:outline-none"
            />
          </div>
          {userSearchQuery && (
            <p className="text-sm text-slate-500">
              {filteredUsers.length} result
              {filteredUsers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {userSaveError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-sgu-red">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />
            {userSaveError}
          </div>
        )}

        {usersLoading ? (
          <div className="flex min-h-[24vh] items-center justify-center">
            <p className="text-sm font-semibold text-slate-500">
              Loading users…
            </p>
          </div>
        ) : usersLoadError ? (
          <div className="card-surface p-10 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-sgu-red" />
            <p className="mt-3 text-sm font-semibold text-sgu-red">
              {usersLoadError}
            </p>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="button-primary mt-4 rounded-xl px-4 py-2 text-sm"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <FiUsers className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-lg font-bold text-sgu-navy">
              {userSearchQuery ? "No users match your search" : "No users yet"}
            </p>
          </div>
        ) : (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {[
                      "Name",
                      "Email",
                      "ID",
                      "Current Role",
                      "New Role",
                      "Updated",
                      "Actions",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((entry) => {
                    const draftRole = roleDraftById[entry.id] ?? entry.role;
                    const roleChanged = draftRole !== entry.role;
                    const isSaving = savingRoleUserId === entry.id;

                    return (
                      <tr
                        key={entry.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-semibold text-sgu-navy">
                          {entry.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {entry.email}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {entry.id}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              entry.role === "ADMIN"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {entry.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={draftRole}
                            onChange={(e) =>
                              handleRoleDraftChange(
                                entry.id,
                                e.target.value as UserRole,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-sgu-navy focus:border-sgu-turquoise focus:outline-none"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(entry.updatedAt).toLocaleDateString(
                            "en-US",
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => void handleRoleSave(entry)}
                            disabled={!roleChanged || isSaving}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-sgu-navy transition-colors hover:border-sgu-navy disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Saving
                              </>
                            ) : (
                              <>
                                <FiSave className="h-3.5 w-3.5" />
                                Save Role
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400">
                {filteredUsers.length} of {totalUsers} user
                {totalUsers !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="card-surface w-full max-w-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-sgu-navy">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-5 px-6 py-5"
            >
              {/* Product ID — readonly on edit */}
              {editingId && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Product ID
                  </p>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-500">
                    {editingId}
                  </p>
                </div>
              )}

              {/* Name */}
              <FormField label="Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Product display name"
                  required
                  maxLength={180}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Subtitle" required>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    handleFieldChange("subtitle", e.target.value)
                  }
                  placeholder="Short product subtitle"
                  required
                  maxLength={180}
                  className={inputClass}
                />
              </FormField>

              {/* Description */}
              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Short product description…"
                  rows={3}
                  maxLength={2000}
                  className={`${inputClass} resize-none`}
                />
              </FormField>

              {/* Category + Tags */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => {
                      handleFieldChange("category", e.target.value);
                      if (e.target.value !== CUSTOM_CATEGORY_VALUE) {
                        handleFieldChange("customCategory", "");
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value={CUSTOM_CATEGORY_VALUE}>Other</option>
                  </select>
                  {form.category === CUSTOM_CATEGORY_VALUE && (
                    <input
                      type="text"
                      value={form.customCategory}
                      onChange={(e) =>
                        handleFieldChange("customCategory", e.target.value)
                      }
                      placeholder="Enter custom category"
                      maxLength={120}
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </FormField>
                <FormField label="Tags (comma-separated)">
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => handleFieldChange("tags", e.target.value)}
                    placeholder="e.g. hoodie, navy, casual"
                    className={inputClass}
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <select
                      value={tagDraft}
                      onChange={(e) => {
                        const nextTag = e.target.value;
                        setTagDraft("");
                        if (!nextTag) return;
                        addSuggestedTag(nextTag);
                      }}
                      className={inputClass}
                    >
                      <option value="">Add a suggested tag</option>
                      {availableTagOptions.map((tag) => (
                        <option key={tag} value={tag}>
                          {titleCase(tag)}
                        </option>
                      ))}
                    </select>
                    {selectedTags.length > 0 && (
                      <span className="self-center text-xs font-semibold text-slate-500">
                        {selectedTags.length} selected
                      </span>
                    )}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100"
                          aria-label={`Remove ${tag} tag`}
                        >
                          {tag}
                          <FiX className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </FormField>
              </div>

              {/* Image URL */}
              <FormField label="Image URL" required>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    handleFieldChange("image", e.target.value)
                  }
                  placeholder="https://…"
                  maxLength={2048}
                  required
                  className={inputClass}
                />
                {form.image && !imageError && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                    <p className="text-xs text-slate-400">Image preview</p>
                  </div>
                )}
                {form.image && imageError && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Could not load image preview.
                  </p>
                )}
              </FormField>

              {/* Price / Rating / Review Count */}
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Price (USD)" required>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) =>
                      handleFieldChange("basePrice", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Rating (0–5)">
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) =>
                      handleFieldChange("rating", e.target.value)
                    }
                    placeholder="4.5"
                    step="0.1"
                    min="0"
                    max="5"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Review Count">
                  <input
                    type="number"
                    value={form.reviewCount}
                    onChange={(e) =>
                      handleFieldChange("reviewCount", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className={inputClass}
                  />
                </FormField>
              </div>

              {/* Inventory */}
              <FormField label="Inventory">
                <input
                  type="number"
                  value={form.inventory}
                  onChange={(e) =>
                    handleFieldChange("inventory", e.target.value)
                  }
                  placeholder="0"
                  min="0"
                  className={`${inputClass} max-w-[160px]`}
                />
              </FormField>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <Toggle
                  label="In Stock"
                  checked={form.inStock}
                  onChange={(v) => handleFieldChange("inStock", v)}
                />
                <Toggle
                  label="Active"
                  checked={form.isActive}
                  onChange={(v) => handleFieldChange("isActive", v)}
                />
              </div>

              {/* Save error */}
              {saveError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-sgu-red">
                  <FiAlertTriangle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              )}

              {/* Footer actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      {editingId ? "Save Changes" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
