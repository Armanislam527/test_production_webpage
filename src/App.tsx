import { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
const ProductList = lazy(() => import('./components/ProductList'));
const CompareProducts = lazy(() => import('./components/CompareProducts'));
const ShopRegistration = lazy(() => import('./components/ShopRegistration'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
import { Product, getPlatformStats, PlatformStats, recordVisit } from './lib/supabase';
import { Store, Shield } from 'lucide-react';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [compareProducts] = useState<Product[]>([]);
  const [showShopReg, setShowShopReg] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    total_visitors: 0,
    total_products: 0,
    total_shops: 0,
    total_reviews: 0,
    total_users: 0,
  });
  const { user, profile } = useAuth();

  useEffect(() => {
    const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);

    recordVisit(sessionId, user?.id);

    const loadStats = async () => {
      const platformStats = await getPlatformStats();
      setStats(platformStats);
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle hash-based routing for auth modal
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#signin' || hash === '#signup') {
        setShowAuthModal(true);
      } else {
        setShowAuthModal(false);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchQuery} onCategoryChange={setCategorySlug} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Electronics Product Database
              </h1>
              <p className="text-gray-600 mt-2">
                Explore specifications, compare products, and read reviews
              </p>
            </div>
            <div className="flex gap-3">
              {user && profile?.role !== 'shop_owner' && profile?.role !== 'admin' && (
                <button
                  onClick={() => setShowShopReg(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                >
                  <Store className="w-5 h-5" />
                  Register Shop
                </button>
              )}
              {profile?.role === 'admin' && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900"
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">{stats.total_visitors.toLocaleString()}</h3>
                <p className="text-blue-100">Total Visitors</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{stats.total_products.toLocaleString()}</h3>
                <p className="text-blue-100">Products Listed</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{stats.total_shops.toLocaleString()}</h3>
                <p className="text-blue-100">Verified Shops</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{stats.total_reviews.toLocaleString()}</h3>
                <p className="text-blue-100">User Reviews</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading products…</div>}>
          <ProductList searchQuery={searchQuery} categorySlug={categorySlug} />
        </Suspense>
      </main>

      {showComparison && compareProducts.length > 0 && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 text-white">Loading…</div>}>
          <CompareProducts
            initialProducts={compareProducts}
            onClose={() => setShowComparison(false)}
          />
        </Suspense>
      )}

      {showShopReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="my-8">
            <Suspense fallback={<div className="text-white">Loading…</div>}>
              <ShopRegistration onSuccess={() => setShowShopReg(false)} onClose={() => setShowShopReg(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {showAdmin && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 text-white">Loading…</div>}>
          <AdminPanel onClose={() => setShowAdmin(false)} />
        </Suspense>
      )}

      {showAuthModal && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 text-white">Loading…</div>}>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => {
              setShowAuthModal(false);
              window.location.hash = '';
            }} 
          />
        </Suspense>
      )}

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-blue-600 mb-4">TechSpecs</h3>
              <p className="text-gray-600 text-sm">
                Your trusted source for electronics information, specifications, and reviews.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Smartphones</li>
                <li>Bikes</li>
                <li>Vehicles</li>
                <li>Accessories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Business</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Register Your Shop</li>
                <li>Seller Dashboard</li>
                <li>Business Solutions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
            2025 TechSpecs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
