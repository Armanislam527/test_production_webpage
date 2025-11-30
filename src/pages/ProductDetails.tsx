// src/pages/ProductDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Review } from '../types';
import SEO from '../components/SEO';
import ProductDetail from '../components/ProductDetail';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                if (!data) {
                    navigate('/404', { replace: true });
                    return;
                }

                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">{error || 'Product not found'}</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={product.name}
                description={product.description}
                image={product.images?.[0]}
            />
            <ProductDetail product={product} onClose={() => navigate('/')} />
        </>
    );
}