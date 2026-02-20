import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const EditDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [document, setDocument] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    access_level: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [docData, categoriesData] = await Promise.all([
        documentService.getDocument(id),
        documentService.getCategories(),
      ]);

      if (!isAdmin && (!isManager || docData.uploaded_by !== user?.id)) {
        navigate('/documents');
        return;
      }

      setDocument(docData);
      setCategories(categoriesData);
      setFormData({
        title: docData.title,
        description: docData.description || '',
        category_id: docData.category_id,
        access_level: docData.access_level,
      });
    } catch (error) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await documentService.updateDocument(id, formData);
      navigate(`/documents/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner fullScreen />
      </>
    );
  }

  if (error && !document) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="alert-error">{error}</div>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={`/documents/${id}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Document
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Document</h1>

          {error && (
            <div className="alert-error mb-4">
              {error}
            </div>
          )}

          <div className="alert-info mb-6">
            <strong>Note:</strong> You can only edit the document metadata. The file itself cannot be changed.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level <span className="text-red-500">*</span>
              </label>
              <select
                name="access_level"
                value={formData.access_level}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="public">Public - Visible to all employees</option>
                <option value="department">Department - Visible to department members only</option>
                <option value="private">Private - Visible only to you and admins</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">File Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>File Name:</strong> {document?.file_name}</p>
                <p><strong>File Type:</strong> {document?.file_type?.toUpperCase()}</p>
                <p><strong>File Size:</strong> {document?.file_size_formatted}</p>
                <p><strong>Department:</strong> {document?.department?.name}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <Link to={`/documents/${id}`} className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditDocumentPage;
