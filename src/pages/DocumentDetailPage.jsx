import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentService.getDocument(id);
      setDocument(data);
    } catch (error) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await documentService.downloadDocument(document.id, document.file_name);
    } catch (error) {
      alert('Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(true);
    try {
      await documentService.deleteDocument(document.id);
      navigate('/documents');
    } catch (error) {
      alert('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = () => {
    if (isAdmin) return true;
    if (isManager && document?.uploaded_by === user?.id) return true;
    return false;
  };

  const canDelete = () => {
    return canEdit();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner fullScreen />
      </>
    );
  }

  if (error || !document) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="alert-error">{error || 'Document not found'}</div>
          <Link to="/documents" className="btn-secondary mt-4">
            Back to Documents
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/documents" className="text-blue-600 hover:text-blue-800">
            ← Back to Documents
          </Link>
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`badge ${
                  document.access_level === 'public' ? 'bg-green-100 text-green-800' :
                  document.access_level === 'department' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {document.access_level?.toUpperCase()}
                </span>
                <span className="badge bg-gray-100 text-gray-800">
                  {document.category?.title}
                </span>
                <span className="badge bg-gray-100 text-gray-800">
                  {document.department?.name}
                </span>
              </div>
            </div>
            <div className="text-6xl">
              {document.file_type === 'pdf' && '📄'}
              {document.file_type === 'docx' && '📝'}
              {document.file_type === 'xlsx' && '📊'}
              {['jpg', 'jpeg', 'png'].includes(document.file_type) && '🖼️'}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900">{document.description || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">File Type</h3>
                <p className="text-gray-900">{document.file_type?.toUpperCase()}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">File Size</h3>
                <p className="text-gray-900">{document.file_size_formatted}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Downloads</h3>
                <p className="text-gray-900">{document.download_count}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Uploaded</h3>
                <p className="text-gray-900">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Uploaded By</h3>
              <p className="text-gray-900">{document.uploader?.name}</p>
            </div>
          </div>

          <div className="border-t pt-6 mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary"
            >
              {downloading ? 'Downloading...' : '⬇️ Download'}
            </button>

            {canEdit() && (
              <Link to={`/documents/${document.id}/edit`} className="btn-secondary">
                ✏️ Edit
              </Link>
            )}

            {canDelete() && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentDetailPage;
