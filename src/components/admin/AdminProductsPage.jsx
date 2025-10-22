// src/pages/admin/AdminProductsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productService from "../../services/productService";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);
 
  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Add Product
        </Link>
      </div>

      {/* Products Table */}
      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">
                  <img
                    src={p.image || "https://via.placeholder.com/50"}
                    alt={p.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">₦{p.price}</td>
                <td className="p-3">{p.stock?.quantity || 0}</td>
                <td className="p-3">
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="text-primary-600 hover:underline"
                  >
                    Update
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default AdminProductsPage;
