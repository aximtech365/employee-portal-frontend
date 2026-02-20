import api from './api';

export const documentService = {
  async getDocuments(params = {}) {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data.document;
  },

  async uploadDocument(formData) {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateDocument(id, data) {
    const response = await api.patch(`/documents/${id}`, data);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  async downloadDocument(id, fileName) {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getDepartments() {
    const response = await api.get('/departments');
    return response.data.departments;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data.categories;
  }
};
