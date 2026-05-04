"use client";

import { useCallback, useEffect, useState } from "react";
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

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  tags: "",
  imageUrl: "",
  price: "",
  rating: "",
  reviewCount: "",
  inventory: "",
  inStock: true,
  isActive: true,
};

type FormState = typeof EMPTY_FORM;

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
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
  const { user, token, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listAdminProducts(200);
      setProducts(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      void loadProducts();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, user, loadProducts]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setImageError(false);
    setShowModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category: product.category ?? "",
      tags: product.tags.join(", "),
      imageUrl: product.imageUrl ?? "",
      price: String(product.price),
      rating: product.rating !== null ? String(product.rating) : "",
      reviewCount: String(product.reviewCount),
      inventory: String(product.inventory),
      inStock: product.inStock,
      isActive: product.isActive,
    });
    setSaveError(null);
    setImageError(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setImageError(false);
  };

  const handleFieldChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "imageUrl") setImageError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveError(null);

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingId) {
        const payload: UpdateProductPayload = {
          name: form.name || undefined,
          description: form.description || undefined,
          category: form.category || undefined,
          tags: tagsArray,
          imageUrl: form.imageUrl || undefined,
          price: form.price ? parseFloat(form.price) : undefined,
          rating: form.rating ? parseFloat(form.rating) : undefined,
          reviewCount: form.reviewCount
            ? parseInt(form.reviewCount, 10)
            : undefined,
          inventory: form.inventory ? parseInt(form.inventory, 10) : undefined,
          inStock: form.inStock,
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
          description: form.description || undefined,
          category: form.category || undefined,
          tags: tagsArray,
          imageUrl: form.imageUrl || undefined,
          price: parseFloat(form.price),
          rating: form.rating ? parseFloat(form.rating) : undefined,
          reviewCount: form.reviewCount ? parseInt(form.reviewCount, 10) : 0,
          inventory: form.inventory ? parseInt(form.inventory, 10) : 0,
          inStock: form.inStock,
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
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">
          Checking permissions…
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container-shell py-20 text-center">
        <div className="card-surface mx-auto max-w-md p-10">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-sgu-red">
            <FiXCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-sgu-navy">
            Access Denied
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            This page is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      <div className="container-shell py-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
              Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold text-sgu-navy">Products</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadProducts()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-sgu-navy transition-colors hover:border-sgu-navy disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
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
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
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
                        {formatPrice(product.price)}
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
                            product.inStock
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-sgu-red"
                          }`}
                        >
                          {product.inStock ? (
                            <FiCheckCircle className="h-3 w-3" />
                          ) : (
                            <FiXCircle className="h-3 w-3" />
                          )}
                          {product.inStock ? "In Stock" : "Out"}
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
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                    placeholder="e.g. Apparel"
                    maxLength={120}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Tags (comma-separated)">
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => handleFieldChange("tags", e.target.value)}
                    placeholder="e.g. hoodie, navy, casual"
                    className={inputClass}
                  />
                </FormField>
              </div>

              {/* Image URL */}
              <FormField label="Image URL">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    handleFieldChange("imageUrl", e.target.value)
                  }
                  placeholder="https://…"
                  maxLength={2048}
                  className={inputClass}
                />
                {form.imageUrl && !imageError && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                    <p className="text-xs text-slate-400">Image preview</p>
                  </div>
                )}
                {form.imageUrl && imageError && (
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
                    value={form.price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
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
