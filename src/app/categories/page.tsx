'use client';

import { useState, useEffect, useTransition } from 'react';
import { getCategories, searchCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categoryActions';

type Category = { id: bigint; name: string; description: string | null };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const data = searchQuery ? await searchCategories(searchQuery) : await getCategories();
      setCategories(data);
    });
  };

  useEffect(() => { loadData(); }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingCategory) {
        formData.append('id', editingCategory.id.toString());
        await updateCategory(formData);
        showToast('Category updated!', 'success');
      } else {
        await createCategory(formData);
        showToast('Category created!', 'success');
      }
      setShowModal(false);
      loadData();
    } catch { showToast('Error occurred.', 'error'); }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      showToast('Category deleted!', 'success');
      setShowDeleteConfirm(false);
      setDeletingCategory(null);
      loadData();
    } catch { showToast('Cannot delete — category in use.', 'error'); }
  };

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Test Categories</h1>
        <p className="page-subtitle">Manage classification categories for medical tests</p>
      </div>
      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input id="search-categories" type="text" className="search-input" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button id="btn-create-category" className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowModal(true); }}>+ Add Category</button>
      </div>
      <div className="table-card">
        {categories.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Description</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id.toString()}>
                    <td>{cat.id.toString()}</td>
                    <td className="td-name"><span className="badge badge-category">{cat.name}</span></td>
                    <td>{cat.description || '—'}</td>
                    <td><div className="td-actions">
                      <button className="btn btn-edit" onClick={() => { setEditingCategory(cat); setShowModal(true); }}>✏️ Edit</button>
                      <button className="btn btn-delete" onClick={() => { setDeletingCategory(cat); setShowDeleteConfirm(true); }}>🗑️ Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <p className="empty-title">No categories found</p>
            <p className="empty-text">{searchQuery ? 'Try a different search term.' : 'Create your first category.'}</p>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form action={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">Name</label>
                  <input id="cat-name" name="name" type="text" className="form-input" defaultValue={editingCategory?.name || ''} required maxLength={50} placeholder="e.g. CBC" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cat-desc">Description</label>
                  <textarea id="cat-desc" name="description" className="form-textarea" defaultValue={editingCategory?.description || ''} placeholder="e.g. Complete Blood Count" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && deletingCategory && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-icon">⚠️</div>
              <p className="confirm-text">Delete <span className="confirm-name">{deletingCategory.name}</span>? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={isPending}>{isPending ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </main>
  );
}
