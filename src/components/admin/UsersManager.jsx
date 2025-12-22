import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { User, ExternalLink, Shield, ShieldOff, Mail, Calendar, Package, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersManager() {
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orderForm, setOrderForm] = useState({
    items: [{ type: 'custom', productId: null, name: '', price: '', quantity: 1 }],
  });

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['auth-users'],
    queryFn: async () => {
      try {
        // Call the Edge Function to list users
        const { data, error } = await supabase.functions.invoke('list-users');

        if (error) {
          console.error('List users error:', error);
          setError('Unable to fetch users. This requires admin privileges.');
          return [];
        }

        if (data?.error) {
          console.error('Data error:', data.error);
          setError(data.error);
          return [];
        }

        return data?.users || [];
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Unable to fetch users. Please ensure you have admin access.');
        return [];
      }
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error loading products:', error);
        return [];
      }
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, newRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      queryClient.invalidateQueries(['auth-users']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    },
  });

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId, newRole });
  };

  const createOrderMutation = useMutation({
    mutationFn: async ({ userId, userEmail, userName, items }) => {
      const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

      const { data, error } = await supabase
        .from('Order')
        .insert([{
          user_id: userId,
          customer_email: userEmail,
          customer_name: userName,
          items: items,
          total: total,
          status: 'pending',
          created_date: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Custom order created and assigned successfully',
      });
      setOrderDialogOpen(false);
      setSelectedUser(null);
      setOrderForm({ items: [{ type: 'custom', productId: null, name: '', price: '', quantity: 1 }] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
    },
  });

  const handleOpenOrderDialog = (user) => {
    setSelectedUser(user);
    setOrderDialogOpen(true);
  };

  const handleAddOrderItem = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { type: 'custom', productId: null, name: '', price: '', quantity: 1 }],
    }));
  };

  const handleRemoveOrderItem = (index) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleOrderItemChange = (index, field, value) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;

        // If changing type, reset the item
        if (field === 'type') {
          if (value === 'custom') {
            return { type: 'custom', productId: null, name: '', price: '', quantity: 1 };
          } else {
            return { type: 'product', productId: null, name: '', price: '', quantity: 1 };
          }
        }

        // If selecting a product, populate its data
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            return {
              ...item,
              productId: value,
              name: product.name,
              price: product.price.toString(),
              quantity: item.quantity || 1
            };
          }
        }

        return { ...item, [field]: value };
      }),
    }));
  };

  const handleCreateOrder = () => {
    if (!selectedUser) return;

    const validItems = orderForm.items.filter(item =>
      item.name && item.price && item.quantity
    );

    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one valid item',
        variant: 'destructive',
      });
      return;
    }

    createOrderMutation.mutate({
      userId: selectedUser.id,
      userEmail: selectedUser.email,
      userName: selectedUser.user_metadata?.full_name || selectedUser.user_metadata?.name || 'User',
      items: validItems,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-red-500">
          Note: User management requires Supabase service role key.
          For now, you can manage users directly in the{' '}
          <a
            href="https://app.supabase.com/project/npevhmlqvcsutfrswrag/auth/users"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Supabase Dashboard
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Users</h2>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{users.length}</span> users
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || 'Unnamed User'}
                    </h3>
                    {user.user_metadata?.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {user.email_confirmed_at && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                        <Mail className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {user.last_sign_in_at && (
                      <p className="text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last active {new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleToggle(user.id, user.user_metadata?.role || 'user')}
                    disabled={updateRoleMutation.isLoading}
                    className="flex items-center"
                  >
                    {user.user_metadata?.role === 'admin' ? (
                      <>
                        <ShieldOff className="w-4 h-4 mr-1" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        Make Admin
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenOrderDialog(user)}
                    className="flex items-center"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Assign Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`${createPageUrl('UserProfile')}?id=${user.id}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Custom Order</DialogTitle>
            <DialogDescription>
              Create and assign a custom order to {selectedUser?.user_metadata?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Order Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOrderItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {orderForm.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor={`item-type-${index}`} className="text-xs">Item Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => handleOrderItemChange(index, 'type', value)}
                      >
                        <SelectTrigger id={`item-type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Existing Product</SelectItem>
                          <SelectItem value="custom">Custom Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {item.type === 'product' ? (
                      <div>
                        <Label htmlFor={`item-product-${index}`} className="text-xs">Select Product</Label>
                        <Select
                          value={item.productId || ''}
                          onValueChange={(value) => handleOrderItemChange(index, 'productId', value)}
                        >
                          <SelectTrigger id={`item-product-${index}`}>
                            <SelectValue placeholder="Choose a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor={`item-name-${index}`} className="text-xs">Item Name</Label>
                        <Input
                          id={`item-name-${index}`}
                          placeholder="Product name"
                          value={item.name}
                          onChange={(e) => handleOrderItemChange(index, 'name', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`item-price-${index}`} className="text-xs">Price</Label>
                        <Input
                          id={`item-price-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => handleOrderItemChange(index, 'price', e.target.value)}
                          disabled={item.type === 'product' && item.productId}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`item-quantity-${index}`} className="text-xs">Quantity</Label>
                        <Input
                          id={`item-quantity-${index}`}
                          type="number"
                          min="1"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => handleOrderItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {orderForm.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOrderItem(index)}
                      className="mt-6"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>
                  ${orderForm.items
                    .reduce((sum, item) => {
                      const price = parseFloat(item.price) || 0;
                      const quantity = parseInt(item.quantity) || 0;
                      return sum + (price * quantity);
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOrderDialogOpen(false);
                setSelectedUser(null);
                setOrderForm({ items: [{ type: 'custom', productId: null, name: '', price: '', quantity: 1 }] });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isLoading}
            >
              {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
