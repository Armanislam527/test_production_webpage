import { useState, useEffect } from 'react';
import { Package, Store, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { supabase, Product, Shop, Review } from '../lib/supabase';

type AdminPanelProps = {
  onClose: () => void;
};

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'shops' | 'reviews'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'shops') fetchShops();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchShops = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });
    setShops(data || []);
    setLoading(false);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const updateShopStatus = async (shopId: string, status: string) => {
    await supabase
      .from('shops')
      .update({ status })
      .eq('id', shopId);
    fetchShops();
  };

  const updateReviewStatus = async (reviewId: string, status: string) => {
    await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId);
    fetchReviews();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${activeTab === 'products'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
              }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${activeTab === 'shops'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
              }`}
          >
            <Store className="w-5 h-5" />
            Shops
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${activeTab === 'reviews'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            Reviews
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        Array.isArray(product.images) && product.images[0]
                          ? product.images[0]
                          : 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=200'
                      }
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand} - {product.model}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shops' && (
            <div className="space-y-4">
              {shops.map((shop) => (
                <div key={shop.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                      <p className="text-sm text-gray-600">{shop.email}</p>
                      <p className="text-sm text-gray-600">{shop.phone}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${shop.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : shop.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {shop.status}
                      </span>
                    </div>
                    {shop.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateShopStatus(shop.id, 'approved')}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateShopStatus(shop.id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{review.title}</span>
                        <span className="text-sm text-gray-600">
                          ({review.rating} stars)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.content}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${review.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    {review.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
