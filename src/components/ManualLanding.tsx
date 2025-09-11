import React, { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Resource } from '../types';
import { supabase } from '../supabaseClient';

interface ManualLandingProps {
  id: string;
}

export function ManualLanding({ id }: ManualLandingProps) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select(
            'id, title, description, category, type, file_url, file_name, translations, created_at'
          )
          .eq('id', id)
          .single();

        if (error) throw error;
        setResource(data);
        setSelectedLanguage(data.translations?.[0]?.language || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load manual');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading manual...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || 'Manual not found'}</p>
      </div>
    );
  }

  const currentTranslation = resource.translations?.find(
    (t) => t.language === selectedLanguage
  );
  const fileUrl = currentTranslation?.file_url || resource.file_url;
  const fileName = currentTranslation?.file_name || resource.file_name;

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
        <p className="text-gray-600 mb-4">{resource.description}</p>

        {resource.translations && resource.translations.length > 0 && (
          <div className="mb-4">
            <label
              htmlFor="language-select"
              className="mr-2 text-sm text-gray-700"
            >
              Select Language:
            </label>
            <select
              id="language-select"
              aria-label="Select language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {resource.translations.map((t) => (
                <option key={t.language} value={t.language}>
                  {t.language}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-transparent text-brand border border-brand text-sm font-medium rounded-lg hover:bg-brand/10 transition-colors duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </a>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-transparent text-brand border border-brand text-sm font-medium rounded-lg hover:bg-brand/10 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualLanding;
