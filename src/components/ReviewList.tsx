import { Star, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Review, voteReview, getUserVote } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ReviewListProps = {
  reviews: Review[];
  onReviewUpdate?: () => void;
};

export default function ReviewList({ reviews, onReviewUpdate }: ReviewListProps) {
  const { user } = useAuth();
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      // Load user votes for all reviews
      const loadVotes = async () => {
        const votes: Record<string, boolean | null> = {};
        for (const review of reviews) {
          try {
            const vote = await getUserVote(review.id);
            votes[review.id] = vote;
          } catch (error) {
            console.error('Error loading vote for review:', review.id, error);
            votes[review.id] = null;
          }
        }
        setUserVotes(votes);
      };
      loadVotes();
    }
  }, [user, reviews]);

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      await voteReview(reviewId, isHelpful);
      setUserVotes(prev => ({ ...prev, [reviewId]: isHelpful }));
      onReviewUpdate?.(); // Refresh reviews to get updated helpful count
    } catch (error) {
      console.error('Error voting on review:', error);
    } finally {
      setLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

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
            <button 
              className={`flex items-center gap-1 transition-colors ${
                userVotes[review.id] === true 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              } ${loading[review.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote(review.id, true)}
              disabled={loading[review.id] || !user}
              title={!user ? 'Sign in to vote' : ''}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
