import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Resource } from '../types';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, category, type, file_url, file_name, icon_url, qr_code, created_at, updated_at, translations')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([resource])
        .select()
        .single();

      if (error) throw error;
      setResources(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add resource');
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete resource');
    }
  };

  const updateResource = async (id: string, updates: Partial<Omit<Resource, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setResources(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update resource');
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    loading,
    error,
    addResource,
    deleteResource,
    updateResource,
    refetch: fetchResources
  };
}