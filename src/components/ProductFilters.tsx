import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ProductFilters() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        category: searchParams.get('category') || '',
        query: searchParams.get('q') || '',
    });
    const [isOpen, setIsOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();

            if (filters.query) params.set('q', filters.query);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            if (filters.category) params.set('category', filters.category);

            setSearchParams(params, { replace: true });
        }, 500);

        return () => clearTimeout(timer);
    }, [filters, setSearchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                    {isOpen ? 'Hide Filters' : 'Show Filters'}
                    <svg
                        className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
                {Object.values(filters).some(Boolean) && (
                    <button
                        onClick={() => {
                            setFilters({
                                minPrice: '',
                                maxPrice: '',
                                category: '',
                                query: '',
                            });
                            setSearchParams({});
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                name="query"
                                value={filters.query}
                                onChange={handleChange}
                                placeholder="Search products..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Price
                            </label>
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleChange}
                                placeholder="Min"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Price
                            </label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleChange}
                                placeholder="Max"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Categories</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                {/* Add more categories as needed */}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}