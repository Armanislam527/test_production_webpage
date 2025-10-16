import { useState } from 'react';
import { Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import ProfileEdit from './ProfileEdit';

type HeaderProps = {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
};

export default function Header({ onSearch, onCategoryChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const categories = [
    { name: 'All', slug: '' },
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Bikes', slug: 'bikes' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'PC Accessories', slug: 'pc-accessories' },
    { name: 'Accessories', slug: 'electric-accessories' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-blue-600">TechSpecs</h1>

              <nav className="hidden md:flex space-x-6">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => onCategoryChange(cat.slug)}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </form>

              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                    onClick={(e) => {
                      const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                        if (dropdown) dropdown.classList.remove('hidden');
                      }
                    }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{profile?.full_name || 'Account'}</span>
                  </button>
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden z-50"
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.classList.remove('hidden');
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.classList.add('hidden');
                      }
                    }}
                  >
                    <div className="px-4 py-2 text-sm text-gray-600 border-b">
                      {profile?.email}
                    </div>
                    <button
                      onClick={() => setProfileEditOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Profile
                    </button>
                    {profile?.role === 'shop_owner' && (
                      <a href="#shop-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Shop
                      </a>
                    )}
                    {profile?.role === 'admin' && (
                      <a href="#admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Panel
                      </a>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      onCategoryChange(cat.slug);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {profileEditOpen && <ProfileEdit onClose={() => setProfileEditOpen(false)} />}
    </>
  );
}
