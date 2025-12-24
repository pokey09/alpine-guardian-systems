import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X, Upload, FileArchive } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function ProductsManager() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    is_subscription: false,
    subscription_interval: '',
    stripe_price_id: '',
    stripe_recurring_price_id: '',
    rating: 5,
    template_url: '',
    is_one_click_host: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      setError(null);
    },
    onError: (err) => {
      console.error('Create error:', err);
      setError(`Failed to create product: ${err.message}`);
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
      setError(null);
    },
    onError: (err) => {
      console.error('Update error:', err);
      setError(`Failed to update product: ${err.message}`);
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
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      is_subscription: false,
      subscription_interval: '',
      stripe_price_id: '',
      stripe_recurring_price_id: '',
      rating: 5,
      template_url: '',
      is_one_click_host: false,
    });
    setTemplateFile(null);
    setEditingProduct(null);
    setShowForm(false);
    setError(null);
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
      stripe_price_id: product.stripe_price_id || '',
      stripe_recurring_price_id: product.stripe_recurring_price_id || '',
      rating: product.rating,
      template_url: product.template_url || '',
      is_one_click_host: product.is_one_click_host || false,
    });
    setTemplateFile(null);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (accept zip files)
      if (!file.name.endsWith('.zip')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a .zip file',
          variant: 'destructive',
        });
        return;
      }
      setTemplateFile(file);
    }
  };

  const uploadTemplateFile = async (file) => {
    if (!file) return null;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `templates/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-templates')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload template file',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload template file if one is selected
    let templateUrl = formData.template_url;
    if (templateFile) {
      const uploadedUrl = await uploadTemplateFile(templateFile);
      if (!uploadedUrl) {
        setError('Failed to upload template file');
        return;
      }
      templateUrl = uploadedUrl;
    }

    // Build data object with only defined values
    const data = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      rating: parseInt(formData.rating),
      is_subscription: formData.is_subscription,
      subscription_interval: formData.is_subscription && formData.subscription_interval
        ? formData.subscription_interval
        : null,
      is_one_click_host: formData.is_one_click_host,
    };

    // Only add optional fields if they have values
    if (formData.image && formData.image.trim()) {
      data.image = formData.image;
    }
    if (formData.stripe_price_id && formData.stripe_price_id.trim()) {
      data.stripe_price_id = formData.stripe_price_id;
    }
    if (formData.stripe_recurring_price_id && formData.stripe_recurring_price_id.trim()) {
      data.stripe_recurring_price_id = formData.stripe_recurring_price_id;
    }
    if (templateUrl && templateUrl.trim()) {
      data.template_url = templateUrl;
    }

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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Stripe Price ID (one-time)</Label>
                <Input
                  value={formData.stripe_price_id}
                  onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                  placeholder="price_..."
                />
              </div>
              <div>
                <Label>Stripe Recurring Price ID</Label>
                <Input
                  value={formData.stripe_recurring_price_id}
                  onChange={(e) => setFormData({ ...formData, stripe_recurring_price_id: e.target.value })}
                  placeholder="price_... (recurring)"
                />
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

            <div className="border-t border-slate-200 pt-4 mt-4">
              <h4 className="font-semibold text-slate-900 mb-4">One-Click Host Settings</h4>

              <div className="flex items-center space-x-3 mb-4">
                <Checkbox
                  id="is_one_click_host"
                  checked={formData.is_one_click_host}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_one_click_host: !!checked })}
                />
                <Label htmlFor="is_one_click_host" className="mt-0">
                  This is a One-Click Host product
                </Label>
              </div>

              {formData.is_one_click_host && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="template-file" className="flex items-center gap-2">
                      <FileArchive className="w-4 h-4" />
                      Template File (.zip)
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="template-file"
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {templateFile && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Selected: {templateFile.name}
                        </p>
                      )}
                      {formData.template_url && !templateFile && (
                        <p className="text-sm text-slate-600 mt-2">
                          Current template: <a href={formData.template_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View file</a>
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload a .zip file containing the website template
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={uploadingFile}
            >
              {uploadingFile ? 'Uploading...' : editingProduct ? 'Update' : 'Create'} Product
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
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <p className="text-red-600 font-bold">${product.price}</p>
                {product.is_subscription && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {product.subscription_interval || 'subscription'}
                  </span>
                )}
                {product.is_one_click_host && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                    <FileArchive className="w-3 h-3" />
                    One-Click Host
                  </span>
                )}
                {product.template_url && (
                  <a
                    href={product.template_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Template File
                  </a>
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
