import { Link } from 'react-router-dom';

const DocumentCard = ({ document, onDelete }) => {
  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      docx: '📝',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
    };
    return icons[type?.toLowerCase()] || '📎';
  };

  const getAccessLevelBadge = (level) => {
    const badges = {
      public: 'bg-green-100 text-green-800',
      department: 'bg-blue-100 text-blue-800',
      private: 'bg-red-100 text-red-800',
    };
    return badges[level] || badges.public;
  };

  return (
    <Link
      to={`/documents/${document.id}`}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{getFileIcon(document.file_type)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {document.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {document.description || 'No description'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`badge ${getAccessLevelBadge(document.access_level)}`}>
              {document.access_level?.toUpperCase()}
            </span>
            <span className="badge bg-gray-100 text-gray-800">
              {document.category?.title}
            </span>
            <span className="badge bg-gray-100 text-gray-800">
              {document.department?.name}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Uploaded by {document.uploader?.name}</span>
            <span>{document.file_size_formatted}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span>Downloads: {document.download_count}</span>
            <span className="mx-2">•</span>
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;
