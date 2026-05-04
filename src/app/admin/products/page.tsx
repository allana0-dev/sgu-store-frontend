import type { Metadata } from "next";
import AdminProductsClient from "./AdminProductsClient";

export const metadata: Metadata = {
  title: "Admin — Products | SGU Campus Store",
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
