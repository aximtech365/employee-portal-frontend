import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    category_id: '',
    department_id: user?.department_id || '',
    access_level: 'public',
  });

  useEffect(() => {
    if (!isAdmin && !isManager) {
      navigate('/documents');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, departmentsData] = await Promise.all([
        documentService.getCategories(),
        documentService.getDepartments(),
      ]);
      setCategories(categoriesData);
      setDepartments(departmentsData);
    } catch (error) {
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF, DOCX, XLSX, JPG, PNG are allowed.');
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit.');
        e.target.value = '';
        return;
      }

      setError('');
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (!isAdmin && formData.department_id != user?.department_id) {
      setError('Managers can only upload to their own department');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('file', formData.file);
      uploadData.append('category_id', formData.category_id);
      uploadData.append('department_id', formData.department_id);
      uploadData.append('access_level', formData.access_level);

      const response = await documentService.uploadDocument(uploadData);
      navigate(`/documents/${response.document.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
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

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/documents" className="text-blue-600 hover:text-blue-800">
            ← Back to Documents
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>

          {error && (
            <div className="alert-error mb-4">
              {error}
            </div>
          )}

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
                placeholder="Enter document title"
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
                placeholder="Enter document description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="input-field"
                accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
              />
              <p className="mt-1 text-sm text-gray-500">
                Accepted formats: PDF, DOCX, XLSX, JPG, PNG (Max 10MB)
              </p>
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
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                className="input-field"
                disabled={!isAdmin}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {!isAdmin && (
                <p className="mt-1 text-sm text-gray-500">
                  Managers can only upload to their own department
                </p>
              )}
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

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? 'Uploading...' : '⬆️ Upload Document'}
              </button>
              <Link to="/documents" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadDocumentPage;
