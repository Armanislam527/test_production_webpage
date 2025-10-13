import { Star, ThumbsUp } from 'lucide-react';
import { Review } from '../lib/supabase';

type ReviewListProps = {
  reviews: Review[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {review.rating}.0
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-gray-700 mb-3">{review.content}</p>

          <div className="flex items-center gap-4 text-sm">
            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
