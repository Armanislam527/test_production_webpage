// src/types/index.ts
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    brand: string;
    category: string;
    specifications: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        id: string;
        email: string;
        user_metadata: {
            full_name: string;
            avatar_url?: string;
        };
    };
}