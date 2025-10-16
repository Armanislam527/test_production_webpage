import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Product, supabase } from '../lib/supabase';

type CompareProductsProps = {
  initialProducts: Product[];
  onClose: () => void;
};

export default function CompareProducts({ initialProducts, onClose }: CompareProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts.slice(0, 4));
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name');
    setAllProducts(data || []);
  };

  const addProduct = (product: Product) => {
    if (products.length < 4 && !products.find(p => p.id === product.id)) {
      setProducts([...products, product]);
      setShowAddProduct(false);
    }
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const allSpecs = Array.from(
    new Set(
      products.flatMap(p =>
        p.specifications ? Object.keys(p.specifications) : []
      )
    )
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8 relative">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Compare Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 bg-gray-50 font-semibold w-48">
                  Specification
                </th>
                {products.map((product) => (
                  <th key={product.id} className="py-4 px-4 bg-gray-50 min-w-64">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <img
                        src={
                          Array.isArray(product.images) && product.images[0]
                            ? product.images[0]
                            : 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'
                        }
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                  </th>
                ))}
                {products.length < 4 && (
                  <th className="py-4 px-4 bg-gray-50 min-w-64">
                    <button
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium text-gray-700">Price</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4 text-center">
                    {product.price ? `$${product.price.toLocaleString()}` : 'N/A'}
                  </td>
                ))}
              </tr>

              <tr className="border-b">
                <td className="py-3 px-4 font-medium text-gray-700">Status</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                ))}
              </tr>

              {allSpecs.map((spec) => (
                <tr key={spec} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-700 capitalize">
                    {spec.replace(/_/g, ' ')}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="py-3 px-4 text-center text-gray-600">
                      {product.specifications?.[spec]
                        ? String(product.specifications[spec])
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddProduct && (
          <div className="border-t p-6">
            <h3 className="font-semibold mb-4">Select a product to add</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {allProducts
                .filter(p => !products.find(prod => prod.id === p.id))
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="text-left p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50"
                  >
                    <img
                      src={
                        Array.isArray(product.images) && product.images[0]
                          ? product.images[0]
                          : 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=200'
                      }
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.brand}</p>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
