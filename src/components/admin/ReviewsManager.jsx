import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Star, Check, X, Trash2, User } from 'lucide-react';

export default function ReviewsManager() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['allReviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .order('created_date', { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('Review')
        .update({ status })
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('Review')
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Management</h2>
      
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No reviews yet</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{review.user_name}</h3>
                      <p className="text-sm text-slate-600">{review.user_email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-slate-700 font-medium mb-1">Product: {review.product_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-4">{review.comment}</p>

                  <div className="flex gap-2">
                    {review.status !== 'approved' && (
                      <Button
                        onClick={() => updateMutation.mutate({ id: review.id, status: 'approved' })}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        onClick={() => updateMutation.mutate({ id: review.id, status: 'rejected' })}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteMutation.mutate(review.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}