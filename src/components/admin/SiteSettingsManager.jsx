import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

export default function SiteSettingsManager() {
  const [formData, setFormData] = useState({
    logo_url: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    contact_email: '',
    tagline: '',
  });

  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('SiteSettings')
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
        .from('SiteSettings')
        .insert([data]);
      if (error) {
        throw new Error(error.message);
      }
      return newData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updatedData, error } = await supabase
        .from('SiteSettings')
        .update(data)
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      setFormData(settings[0]);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (settings.length > 0) {
      updateMutation.mutate({ id: settings[0].id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Site Settings</h2>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Logo URL</Label>
            <Input
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label>Company Tagline</Label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Modern tools for mountain heroes."
            />
          </div>

          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Facebook URL</Label>
              <Input
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label>Twitter URL</Label>
              <Input
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/yourprofile"
              />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>

          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}