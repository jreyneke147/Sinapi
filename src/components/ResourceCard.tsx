import React from 'react';
import { Download, QrCode, Trash2, Eye, Edit } from 'lucide-react';
import { Resource } from '../types';
import { generateQRCode } from '../utils/qrCode';

interface ResourceCardProps {
  resource: Resource;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (resource: Resource) => void;
}

export function ResourceCard({ resource, isAdmin = false, onDelete, onEdit }: ResourceCardProps) {
  const [showQR, setShowQR] = React.useState(false);
  const initialLanguage = resource.translations?.[0]?.language || '';
  const [selectedLanguage, setSelectedLanguage] = React.useState(initialLanguage);

  const currentTranslation = resource.translations?.find(
    t => t.language === selectedLanguage
  );
  const fileUrl = currentTranslation?.file_url || resource.file_url;
  const fileName = currentTranslation?.file_name || resource.file_name;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const landingUrl = `${baseUrl}/?manual=${resource.id}`;

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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="p-6">
        <div className={`mb-4 ${resource.icon_url ? 'flex gap-4 items-start' : ''}`}>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-brand/10 text-brand rounded-full">
              {resource.category}
            </span>
          </div>
          {resource.icon_url && (
            <a 
              href={landingUrl}
              className="flex-shrink-0 block rounded-md overflow-hidden hover:shadow-sm transition-shadow ml-4"
              aria-label={`View ${resource.title}`}
            >
              <img
                src={resource.icon_url}
                alt={`${resource.title} icon`}
                className="w-24 h-24 object-cover transform scale-x-[-1]"
              />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Added {new Date(resource.created_at).toLocaleDateString()}
          </span>

          <div className="flex flex-wrap items-center gap-2 justify-end">
              {resource.translations && resource.translations.length > 0 && (
                <>
                  <label htmlFor="language-select" className="text-sm text-gray-700 mr-2">Select Language:</label>
                  <select
                    id="language-select"
                    aria-label="Select language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm flex-shrink-0"
                  >
                    {resource.translations.map((t) => (
                      <option key={t.language} value={t.language}>
                        {t.language}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <button
                onClick={() => setShowQR(!showQR)}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 bg-transparent text-brand border border-brand text-sm font-medium rounded-lg hover:bg-brand/10 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </a>

              <button
                onClick={handleDownload}
                className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 bg-transparent text-brand border border-brand text-sm font-medium rounded-lg hover:bg-brand/10 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>

              {isAdmin && onDelete && (
                <>
                  <button
                    onClick={() => onEdit?.(resource)}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-200 flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                <button
                  onClick={() => onDelete(resource.id)}
                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </>
              )}
            </div>
          </div>

        {showQR && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-2">Scan to open manual</p>
            <img
              src={generateQRCode(landingUrl)}
              alt="QR Code"
              className="mx-auto w-32 h-32 border border-gray-200 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
