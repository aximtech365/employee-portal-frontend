import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentService } from '../services/documentService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [stats, setStats] = useState({ total: 0, department: 0, public: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await documentService.getDocuments();
      const documents = data.documents || [];
      
      setStats({
        total: documents.length,
        department: documents.filter(doc => doc.access_level === 'department').length,
        public: documents.filter(doc => doc.access_level === 'public').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    if (isAdmin) return 'badge-admin';
    if (isManager) return 'badge-manager';
    return 'badge-employee';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-gray-600">Role:</span>
            <span className={`badge ${getRoleColor()}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-gray-600">
            Department: {user?.department?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Documents</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="text-5xl opacity-50">📁</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Public Documents</p>
                <p className="text-4xl font-bold mt-2">{stats.public}</p>
              </div>
              <div className="text-5xl opacity-50">🌐</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Department Documents</p>
                <p className="text-4xl font-bold mt-2">{stats.department}</p>
              </div>
              <div className="text-5xl opacity-50">🏢</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/documents"
              className="flex items-center space-x-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-3xl">📄</div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Documents</h3>
                <p className="text-sm text-gray-600">View and search all documents</p>
              </div>
            </Link>

            {(isAdmin || isManager) && (
              <Link
                to="/documents/upload"
                className="flex items-center space-x-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-3xl">⬆️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Document</h3>
                  <p className="text-sm text-gray-600">Add new documents to the portal</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Your Permissions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {isAdmin && (
              <>
                <li>✓ View all documents</li>
                <li>✓ Upload to any department</li>
                <li>✓ Edit and delete any document</li>
              </>
            )}
            {isManager && (
              <>
                <li>✓ View public and department documents</li>
                <li>✓ Upload to your department</li>
                <li>✓ Edit and delete your own documents</li>
              </>
            )}
            {isEmployee && (
              <>
                <li>✓ View public documents</li>
                <li>✓ Download allowed documents</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
