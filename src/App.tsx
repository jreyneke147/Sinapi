import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Search,
  Download,
  FileText,
  User,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Menu,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [newFile, setNewFile] = useState<File | null>(null);

  const categories = ['all', ...new Set(resources.map((r) => r.category))];

  const filteredResources = resources.filter((resource) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      resource.title.toLowerCase().includes(q) ||
      resource.description.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cleanup: revoke any blob: URLs when a resource is removed or component unmounts
  useEffect(() => {
    return () => {
      resources.forEach((r) => {
        if (r.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(r.fileUrl);
      });
    };
  }, [resources]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow demo credentials for local testing
    if (username === 'admin' && password === 'demo') {
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) {
      alert('Invalid credentials. Use admin/demo');
    } else {
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
    }
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResource.title && newResource.description && newResource.category && newFile) {
      const resource: Resource = {
        id: Date.now().toString(),
        ...newResource,
        fileUrl: URL.createObjectURL(newFile),
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      setResources((prev) => [resource, ...prev]);
      setNewResource({ title: '', description: '', category: '' });
      setNewFile(null);
    }
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => {
      const victim = prev.find((r) => r.id === id);
      if (victim?.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(victim.fileUrl);
      return prev.filter((r) => r.id !== id);
    });
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {resource.category}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Added {resource.uploadedAt}</span>

          {/* Use a real download link */}
          <a
            href={resource.fileUrl}
            download={resource.title.replace(/\s+/g, '_')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-900 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="/sinapi-logo.svg" alt="Sinapi Biomedical logo" className="h-8 w-auto" />
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
            <span className="font-medium">Menu</span>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {isMenuOpen && (
          <nav className="absolute right-4 top-16 bg-white text-gray-900 shadow-lg rounded-md py-2 w-40">
            <a href="#manuals" className="block px-4 py-2 hover:bg-gray-100">
              Manuals
            </a>
            <button
              onClick={() => {
                setIsAdminOpen(!isAdminOpen);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Evidence-first ICU Solutions</h2>
          <p className="text-lg text-blue-100 mb-6">
            Designed for clinicians who need measurable results and ERAS-aligned outcomes.
          </p>
          <div className="border-l border-blue-300 pl-6 mb-8">
            <ul className="list-disc space-y-2">
              <li>Early mobility</li>
              <li>Less effort</li>
              <li>Cost savings</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <img
              src="https://placehold.co/600x200?text=Product+Illustration&bg=E5E7EB&fc=9CA3AF"
              alt="Product illustration"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manuals..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-blue-200 text-gray-900 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      {isAdminOpen && (
        <section className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center">
                  <Lock className="w-5 h-5 mr-2 text-blue-600" />
                  Admin Login
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
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
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <p className="text-sm text-gray-600 text-center">Demo credentials: admin / demo</p>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Resource Management</h3>
                  <button onClick={() => setIsLoggedIn(false)} className="text-red-600 hover:text-red-700 text-sm">
                    Logout
                  </button>
                </div>

                <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={newResource.description}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={newResource.category}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Title</th>
                        <th className="text-left py-2 px-3">Category</th>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-center py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={resource.id} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">{resource.title}</td>
                          <td className="py-2 px-3">{resource.category}</td>
                          <td className="py-2 px-3">{resource.uploadedAt}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Manuals Section */}
        <section id="manuals">
          <div className="flex items-center mb-8">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">How-to Manuals</h2>
            <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredResources.length} available
            </span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No manuals found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((manual) => (
                <ResourceCard key={manual.id} resource={manual} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/sinapi-logo.svg" alt="Sinapi Biomedical logo" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400">
                Leading provider of advanced medical imaging technology and solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="text-gray-400 space-y-2">
                <p>Phone: +1 (555) 123-4567</p>
                <p>Email: support@sinapi.com</p>
                <p>Technical Support: tech@sinapi.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="text-gray-400 space-y-2">
                <a href="#manuals" className="block hover:text-white transition-colors">
                  Manuals
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Technical Support
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Sinapi Medical Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
