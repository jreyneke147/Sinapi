import React from 'react';
import { Download, QrCode, Trash2, Eye } from 'lucide-react';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export function ResourceCard({ resource, isAdmin = false, onDelete }: ResourceCardProps) {
  const [showQR, setShowQR] = React.useState(false);

  return (
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
          <span className="text-xs text-gray-500">
            Added {new Date(resource.created_at).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-transparent text-blue-600 border border-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </a>

            <a
              href={resource.file_url}
              download={resource.file_name}
              className="inline-flex items-center px-4 py-2 bg-transparent text-blue-600 border border-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>

            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(resource.id)}
                className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {showQR && resource.qr_code && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-2">Scan to download</p>
            <img
              src={resource.qr_code}
              alt="QR Code"
              className="mx-auto w-32 h-32 border border-gray-200 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}