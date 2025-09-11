import React, { useState } from 'react';
import {
  Search,
  FileText,
  User,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useResources } from './hooks/useResources';
import { ResourceCard } from './components/ResourceCard';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resources, loading, error } = useResources();

  const manualCategories = resources
    .filter((r) => r.type === 'manual')
    .map((r) => r.category);
  const categories = ['all', ...new Set(manualCategories)];

  const manuals = resources.filter((resource) => {
    if (resource.type !== 'manual') return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      resource.title.toLowerCase().includes(q) ||
      resource.description.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading resources: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="relative bg-brand text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-brand/50" />
              <div>
                <h1 className="text-xl font-bold">Sinapi</h1>
                <p className="text-xs text-brand/50"></p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-brand transition-colors"
            >
              <span className="font-medium">Menu</span>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {isMenuOpen && (
            <nav className="absolute right-4 top-16 bg-white text-gray-900 shadow-lg rounded-lg py-2 w-48 z-50">
              <a
                href="#manuals"
                className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Manuals
              </a>
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Admin Panel
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-brand text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manuals..."
                className="w-full pl-12 pr-4 py-4 rounded-lg border-0 text-gray-900 focus:ring-4 focus:ring-brand shadow-lg text-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-white text-brand'
                      : 'bg-brand bg-opacity-30 text-brand/70 hover:bg-opacity-50'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Manuals Section */}
        <section id="manuals">
          <div className="flex items-center mb-8">
            <FileText className="w-8 h-8 text-brand mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">How-to Manuals</h2>
            <span className="ml-4 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
              {manuals.length} available
            </span>
          </div>

          {manuals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No manuals found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {manuals.map((manual) => (
                <ResourceCard key={manual.id} resource={manual} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold">Sinapi</h3>
          <p className="text-gray-400 mt-4">
            Leading provider of advanced medical imaging technology and ICU solutions
            designed for evidence-based patient care.
          </p>
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400">
            <p>© 2025 Sinapi. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;