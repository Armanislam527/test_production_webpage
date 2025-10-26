import { useState, useEffect } from 'react';
import { supabase, Product, Category } from '../lib/supabase';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import { Loader } from 'lucide-react';

type ProductListProps = {
  searchQuery: string;
  categorySlug: string;
};

export default function ProductList({ searchQuery, categorySlug }: ProductListProps) {
  const [products, setProducts] = useState<(Product & { category?: Category })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brand: '',
    status: '', // active, upcoming, discontinued
    network: '', // 4g, 5g, touch
    releasedAfter: '', // yyyy-mm-dd
  });

  const debouncedQuery = useDebounced(searchQuery, 300);

  useEffect(() => {
    fetchProducts();
  }, [debouncedQuery, categorySlug, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();

        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (debouncedQuery) {
        const safe = sanitizeLike(debouncedQuery);
        query = query.or(`name.ilike.%${safe}%,brand.ilike.%${safe}%,description.ilike.%${safe}%`);
      }

      // Numeric filters
      if (filters.minPrice) query = query.gte('price', Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice));

      // Status filter
      if (filters.status) query = query.eq('status', filters.status);

      // Brand filter (case-insensitive)
      if (filters.brand) query = query.ilike('brand', `%${sanitizeLike(filters.brand)}%`);

      // Network/spec filters from specifications jsonb
      // Use JSON path accessors where possible so we match common shapes like
      // { "network": "4G" } or { "network": "5G" } or specs mentioning "touch".
      try {
        if (filters.network === '5g') {
          // Look for a network property containing '5g' (case-insensitive)
          query = query.filter("specifications->>network", "ilike", "%5g%");
        }

        if (filters.network === '4g') {
          query = query.filter("specifications->>network", "ilike", "%4g%");
        }

        if (filters.network === 'touch') {
          // As a best-effort fallback, search the JSON text for the word 'touch'
          // which covers displays/specs that mention touch capability.
          query = query.filter("specifications::text", "ilike", "%touch%");
        }
      } catch (e) {
        // Some PostgREST/Supabase setups may not accept complex filter names; fall back
        // to the previous approach (json contains) as a safety net.
        if (filters.network === '5g') query = query.contains('specifications', { '5g': 'Yes' } as any);
        if (filters.network === '4g') query = query.contains('specifications', { '4g': 'Yes' } as any);
        if (filters.network === 'touch') query = query.contains('specifications', { 'display': '' } as any);
      }

      // Release date filter
      if (filters.releasedAfter) query = query.gte('release_date', filters.releasedAfter);

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      brand: '',
      status: '',
      network: '',
      releasedAfter: '',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        </div>
        <div className="grid md:grid-cols-6 gap-3">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Brand"
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="discontinued">Discontinued</option>
          </select>
          <select
            value={filters.network}
            onChange={(e) => setFilters({ ...filters, network: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">Any Network</option>
            <option value="touch">Touch</option>
            <option value="4g">4G</option>
            <option value="5g">5G</option>
          </select>
          <input
            type="date"
            placeholder="Released After"
            value={filters.releasedAfter}
            onChange={(e) => setFilters({ ...filters, releasedAfter: e.target.value })}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

function sanitizeLike(input: string): string {
  // Escape % and _ used by ILIKE (ES2020-compatible)
  return input.split('%').join('\\%').split('_').join('\\_');
}
