import React, { useState } from 'react';
import { Plus, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useResources } from '../hooks/useResources';
import { uploadFile } from '../utils/fileUpload';
import { generateQRCode } from '../utils/qrCode';
import { ResourceCard } from './ResourceCard';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const { resources, addResource, deleteResource } = useResources();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: '',
    type: 'manual' as const,
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [translations, setTranslations] = useState<{ language: string; file: File | null }[]>([]);

  const addTranslationField = () =>
    setTranslations(prev => [...prev, { language: '', file: null }]);

  const updateTranslation = (
    index: number,
    field: 'language' | 'file',
    value: string | File | null
  ) => {
    setTranslations(prev =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const removeTranslationField = (index: number) => {
    setTranslations(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile) return;

    setIsLoading(true);
    try {
      // Upload file to Supabase storage
      const fileUrl = await uploadFile(newFile);

      // Generate QR code
      const qrCode = generateQRCode(fileUrl);

      // Upload translations
      const uploadedTranslations = await Promise.all(
        translations
          .filter(t => t.language && t.file)
          .map(async (t) => {
            const url = await uploadFile(t.file!);
            return { language: t.language, file_url: url, file_name: t.file!.name };
          })
      );

      // Add resource to database
      await addResource({
        ...newResource,
        file_url: fileUrl,
        file_name: newFile.name,
        qr_code: qrCode,
        translations: uploadedTranslations,
      });

      // Reset form
      setNewResource({ title: '', description: '', category: '', type: 'manual' });
      setNewFile(null);
      setTranslations([]);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error(error);
      alert('Failed to add resource. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
        try {
          await deleteResource(id);
        } catch (error) {
          console.error(error);
          alert('Failed to delete resource. Please try again.');
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Admin Login
              </h3>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className="text-sm text-gray-600 text-center">
                  Use your Supabase account credentials
                </p>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium text-gray-900">Welcome, {user?.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Logout
                </button>
              </div>

              {/* Add Resource Form */}
              <form onSubmit={handleAddResource} className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Resource</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={newResource.category}
                    onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-4 mb-4">
                  <h5 className="font-medium text-gray-900">Translations</h5>
                  {translations.map((t, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={t.language}
                        onChange={(e) => updateTranslation(index, 'language', e.target.value)}
                        placeholder="Language"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => updateTranslation(index, 'file', e.target.files?.[0] || null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeTranslationField(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTranslationField}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Translation
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add Resource'}
                </button>
              </form>

              {/* Resource Management */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Manage Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isAdmin={true}
                      onDelete={handleDeleteResource}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}