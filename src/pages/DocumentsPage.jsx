import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import DocumentCard from '../components/DocumentCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentsPage = () => {
  const { isAdmin, isManager } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [search, categoryFilter, departmentFilter]);

  const fetchData = async () => {
    try {
      const [categoriesData, departmentsData] = await Promise.all([
        documentService.getCategories(),
        documentService.getDepartments(),
      ]);
      setCategories(categoriesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;
      if (departmentFilter) params.department_id = departmentFilter;

      const data = await documentService.getDocuments(params);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDepartmentFilter('');
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          {(isAdmin || isManager) && (
            <Link to="/documents/upload" className="btn-primary">
              ⬆️ Upload Document
            </Link>
          )}
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by title or description..."
              />
            </div>
            <FilterDropdown
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories}
              placeholder="All Categories"
            />
            <FilterDropdown
              label="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={departments}
              placeholder="All Departments"
            />
          </div>
          {(search || categoryFilter || departmentFilter) && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : documents.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {search || categoryFilter || departmentFilter
                ? 'Try adjusting your filters'
                : 'No documents available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsPage;
