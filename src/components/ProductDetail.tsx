import { useState, useEffect } from 'react';
import { X, Star, Store, Calendar, DollarSign, Loader2, ShoppingCart, Heart, Share2, ChevronLeft } from 'lucide-react';
import { Product, supabase, Review, ShopProduct, Shop } from '../lib/supabase';
import { optimizeImage } from '../lib/image';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Helmet } from 'react-helmet-async';
import { Product, Review } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: Product;
  onClose?: () => void;
  isModal?: boolean;
}

type ProductDetailProps = {
  product: Product;
  onClose: () => void;
};

type LoadingState = {
  product: boolean;
  reviews: boolean;
  shopProducts: boolean;
};

type ErrorState = {
  message: string;
  type: 'product' | 'reviews' | 'shopProducts';
} | null;

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'availability'>('specs');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shopProducts, setShopProducts] = useState<(ShopProduct & { shop: Shop })[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState<LoadingState>({
    product: false,
    reviews: false,
    shopProducts: false
  });
  const [error, setError] = useState<ErrorState>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'availability') {
      fetchShopProducts();
    }
  }, [activeTab, product.id]);

  const fetchReviews = async () => {
    setIsLoading(prev => ({ ...prev, reviews: true }));
    setError(null);

    try {
      const { data, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError({ message: 'Failed to load reviews', type: 'reviews' });
    } finally {
      setIsLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const fetchShopProducts = async () => {
    setIsLoading(prev => ({ ...prev, shopProducts: true }));
    setError(null);

    try {
      const { data, error: shopError } = await supabase
        .from('shop_products')
        .select(`
          *,
          shop:shops(*)
        `)
        .eq('product_id', product.id);

      if (shopError) throw shopError;
      setShopProducts(data || []);
    } catch (err) {
      console.error('Error fetching shop products:', err);
      setError({ message: 'Failed to load availability', type: 'shopProducts' });
    } finally {
      setIsLoading(prev => ({ ...prev, shopProducts: false }));
    }
  };

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? optimizeImage(product.images[0], 800)
    : 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800';

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const LoadingSkeleton = ({ type }: { type: 'image' | 'text' | 'button' | 'spec' }) => {
    if (type === 'image') {
      return <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg" />;
    }
    if (type === 'text') {
      return <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />;
    }
    if (type === 'button') {
      return <div className="h-10 bg-gray-200 rounded w-full" />;
    }
    return <div className="h-6 bg-gray-200 rounded w-full" />;
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      <LoadingSkeleton type="image" />
      <div className="space-y-2">
        <LoadingSkeleton type="text" />
        <LoadingSkeleton type="text" />
        <LoadingSkeleton type="text" />
      </div>
    </div>
  );

  const renderErrorState = (errorType: string, onRetry: () => void) => (
    <div className="text-center p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 mb-2">Error loading {errorType}</p>
      <button
        onClick={onRetry}
        className="text-blue-600 hover:underline"
      >
        Try again
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{product.name} | {product.brand} - TechSpecs</title>
        <meta
          name="description"
          content={product.description || `Product details for ${product.name} by ${product.brand}`}
        />
        <meta property="og:title" content={`${product.name} | ${product.brand}`} />
        <meta
          property="og:description"
          content={product.description || `Product details for ${product.name}`}
        />
        <meta property="og:type" content="product" />
        {product.images?.[0] && <meta property="og:image" content={product.images[0]} />}
      </Helmet>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-5xl w-full my-8 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="sticky top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 ml-auto"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              {isLoading.product ? (
                <LoadingSkeleton type="image" />
              ) : (
                <>
                  <img
                    src={mainImage}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {Array.isArray(product.images) && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {product.images.slice(1, 5).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${product.name} ${idx + 2}`}
                          loading="lazy"
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-blue-600">{product.brand}</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h2>
                <p className="text-gray-600 mt-2">{product.model}</p>
              </div>

              {product.price && (
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
              )}

              {isLoading.reviews ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              ) : reviews.length > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              ) : null}

              {product.release_date && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Released: {new Date(product.release_date).toLocaleDateString()}
                </div>
              )}

              <p className="text-gray-700 mb-6">{product.description}</p>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'specs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'reviews'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'availability'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Availability
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {activeTab === 'specs' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {user && !showReviewForm && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                      disabled={isLoading.reviews}
                    >
                      {isLoading.reviews ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Write a Review</span>
                      )}
                    </button>
                  </div>
                )}

                {showReviewForm && (
                  <div className="mb-6">
                    <ReviewForm
                      productId={product.id}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        fetchReviews();
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                {isLoading.reviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : error?.type === 'reviews' ? (
                  renderErrorState('reviews', fetchReviews)
                ) : (
                  <ReviewList reviews={reviews} onReviewUpdate={fetchReviews} />
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Available at</h3>
                {isLoading.shopProducts ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : error?.type === 'shopProducts' ? (
                  renderErrorState('availability information', fetchShopProducts)
                ) : shopProducts.length > 0 ? (
                  <div className="space-y-4">
                    {shopProducts.map((sp) => (
                      <div key={sp.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Store className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{sp.shop.name}</h4>
                              {sp.shop.address && (
                                <p className="text-sm text-gray-600">{sp.shop.address}</p>
                              )}
                              {sp.shop.phone && (
                                <p className="text-sm text-gray-600">{sp.shop.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ${sp.price.toLocaleString()}
                            </p>
                            <span
                              className={`text-sm ${sp.stock_status === 'in_stock'
                                ? 'text-green-600'
                                : sp.stock_status === 'pre_order'
                                  ? 'text-blue-600'
                                  : 'text-red-600'
                                }`}
                            >
                              {sp.stock_status === 'in_stock'
                                ? 'In Stock'
                                : sp.stock_status === 'pre_order'
                                  ? 'Pre-Order'
                                  : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No availability information</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}