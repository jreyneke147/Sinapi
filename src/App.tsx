import React, { useState } from 'react';
import {
  Search,
  FileText,
  BookOpen,
  User,
  Menu,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useResources } from './hooks/useResources';
import { ResourceCard } from './components/ResourceCard';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'manual' | 'brochure'>('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resources, loading, error } = useResources();

  const categories = ['all', ...new Set(resources.map((r) => r.category))];

  const filteredResources = resources.filter((resource) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      resource.title.toLowerCase().includes(q) ||
      resource.description.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const manuals = filteredResources.filter(r => r.type === 'manual');
  const brochures = filteredResources.filter(r => r.type === 'brochure');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <header className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-200" />
              <div>
                <h1 className="text-xl font-bold">Sinapi</h1>
                <p className="text-xs text-blue-200">Medical Technologies</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
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
              <a 
                href="#brochures" 
                className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Brochures
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Evidence-first ICU Solutions</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Designed for clinicians who need measurable results and ERAS-aligned outcomes.
            Access our comprehensive library of manuals and product information.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Early Mobility</h3>
              <p className="text-blue-100 text-sm">Accelerate patient recovery with evidence-based protocols</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Less Effort</h3>
              <p className="text-blue-100 text-sm">Reduce staff strain with intelligent assistance systems</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Cost Savings</h3>
              <p className="text-blue-100 text-sm">Optimize resources while improving patient outcomes</p>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manuals and brochures..."
                className="w-full pl-12 pr-4 py-4 rounded-lg border-0 text-gray-900 focus:ring-4 focus:ring-blue-300 shadow-lg text-lg"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {['all', 'manual', 'brochure'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as 'all' | 'manual' | 'brochure')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'bg-blue-800 bg-opacity-50 text-blue-100 hover:bg-opacity-70'
                  }`}
                >
                  {type === 'all' ? 'All Resources' : type === 'manual' ? 'Manuals' : 'Brochures'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-white text-blue-700'
                      : 'bg-blue-800 bg-opacity-30 text-blue-200 hover:bg-opacity-50'
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
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">How-to Manuals</h2>
            <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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

        {/* Brochures Section */}
        <section id="brochures">
          <div className="flex items-center mb-8">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Product Brochures</h2>
            <span className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {brochures.length} available
            </span>
          </div>

          {brochures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No brochures found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brochures.map((brochure) => (
                <ResourceCard key={brochure.id} resource={brochure} />
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
                <Building2 className="w-8 h-8 text-blue-400 mr-2" />
                <div>
                  <h3 className="text-xl font-bold">Sinapi</h3>
                  <p className="text-sm text-gray-400">Medical Technologies</p>
                </div>
              </div>
              <p className="text-gray-400">
                Leading provider of advanced medical imaging technology and ICU solutions 
                designed for evidence-based patient care.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Contact Information
              </h4>
              <div className="text-gray-400 space-y-2">
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 123-4567
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  support@sinapi.com
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  tech@sinapi.com
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Medical District, Healthcare Plaza
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Access</h4>
              <div className="text-gray-400 space-y-2">
                <a href="#manuals" className="block hover:text-white transition-colors">
                  How-to Manuals
                </a>
                <a href="#brochures" className="block hover:text-white transition-colors">
                  Product Brochures
                </a>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="block hover:text-white transition-colors text-left"
                >
                  Admin Access
                </button>
                <a href="mailto:tech@sinapi.com" className="block hover:text-white transition-colors">
                  Technical Support
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Sinapi Medical Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;