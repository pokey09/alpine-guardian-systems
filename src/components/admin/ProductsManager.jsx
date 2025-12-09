import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductsManager() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    is_subscription: false,
    subscription_interval: '',
    rating: 5,
  });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: newData, error } = await supabase
        .from('Product')
        .insert([data]);
      if (error) {
        throw new Error(error.message);
      }
      return newData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updatedData, error } = await supabase
        .from('Product')
        .update(data)
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('Product')
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', price: '', image: '', description: '', is_subscription: false, subscription_interval: '', rating: 5 });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image || '',
      description: product.description,
       is_subscription: product.is_subscription || false,
       subscription_interval: product.subscription_interval || '',
      rating: product.rating,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      rating: parseInt(formData.rating),
      subscription_interval: formData.is_subscription ? formData.subscription_interval || null : null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Products</h2>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{editingProduct ? 'Edit' : 'Add'} Product</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="is_subscription"
                  checked={formData.is_subscription}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_subscription: !!checked })}
                />
                <Label htmlFor="is_subscription" className="mt-0">Subscription product</Label>
              </div>
              <div>
                <Label>Subscription Interval</Label>
                <Select
                  value={formData.subscription_interval}
                  onValueChange={(val) => setFormData({ ...formData, subscription_interval: val })}
                  disabled={!formData.is_subscription}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
            {product.image && (
              <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="text-slate-600 text-sm">{product.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-red-600 font-bold">${product.price}</p>
                {product.is_subscription && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {product.subscription_interval || 'subscription'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(product.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
