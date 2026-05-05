import type { Metadata } from "next";
import AdminProductsClient from "./products/AdminProductsClient";

export const metadata: Metadata = {
  title: "Admin — Products & Users | SGU Campus Store",
};

export default function AdminPage() {
  return <AdminProductsClient />;
}
