import { Star, TrendingUp } from 'lucide-react';
import { Product } from '../lib/supabase';

type ProductCardProps = {
  product: Product & { category?: { name: string } };
  onClick: () => void;
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400';

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    discontinued: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
            {product.status === 'active' ? 'Available' : product.status === 'upcoming' ? 'Coming Soon' : 'Discontinued'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <span className="font-medium text-blue-600">{product.brand}</span>
          {product.category && <span>• {product.category.name}</span>}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between">
          {product.price ? (
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Price varies</span>
          )}

          {product.release_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              {new Date(product.release_date).getFullYear()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
