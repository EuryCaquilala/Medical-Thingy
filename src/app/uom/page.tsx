'use client';

import { useState, useEffect, useTransition } from 'react';
import { getUoms, searchUoms, createUom, updateUom, deleteUom } from '@/app/actions/uomActions';

type Uom = {
  id: bigint;
  name: string;
  description: string | null;
};

export default function UomPage() {
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUom, setEditingUom] = useState<Uom | null>(null);
  const [deletingUom, setDeletingUom] = useState<Uom | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const data = searchQuery ? await searchUoms(searchQuery) : await getUoms();
      setUoms(data);
    });
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingUom(null);
    setShowModal(true);
  };

  const handleEdit = (uom: Uom) => {
    setEditingUom(uom);
    setShowModal(true);
  };

  const handleDeleteClick = (uom: Uom) => {
    setDeletingUom(uom);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingUom) {
        formData.append('id', editingUom.id.toString());
        await updateUom(formData);
        showToast('Unit of Measure updated successfully!', 'success');
      } else {
        await createUom(formData);
        showToast('Unit of Measure created successfully!', 'success');
      }
      setShowModal(false);
      loadData();
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingUom) return;
    try {
      await deleteUom(deletingUom.id);
      showToast('Unit of Measure deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeletingUom(null);
      loadData();
    } catch {
      showToast('Cannot delete — this unit may be in use.', 'error');
    }
  };

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Units of Measure</h1>
        <p className="page-subtitle">Manage measurement units used in medical tests</p>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-uom"
            type="text"
            className="search-input"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button id="btn-create-uom" className="btn btn-primary" onClick={handleCreate}>
          + Add Unit
        </button>
      </div>

      <div className="table-card">
        {uoms.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uoms.map((uom) => (
                  <tr key={uom.id.toString()}>
                    <td>{uom.id.toString()}</td>
                    <td className="td-name">
                      <span className="badge badge-uom">{uom.name}</span>
                    </td>
                    <td>{uom.description || '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-edit" onClick={() => handleEdit(uom)}>✏️ Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDeleteClick(uom)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📏</div>
            <p className="empty-title">No units found</p>
            <p className="empty-text">
              {searchQuery ? 'Try a different search term.' : 'Create your first unit of measure to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUom ? 'Edit Unit' : 'New Unit of Measure'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form action={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="uom-name">Name</label>
                  <input
                    id="uom-name"
                    name="name"
                    type="text"
                    className="form-input"
                    defaultValue={editingUom?.name || ''}
                    required
                    maxLength={15}
                    placeholder="e.g. mg/dL"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="uom-description">Description</label>
                  <textarea
                    id="uom-description"
                    name="description"
                    className="form-textarea"
                    defaultValue={editingUom?.description || ''}
                    placeholder="Describe what this unit measures..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Saving...' : editingUom ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deletingUom && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-icon">⚠️</div>
              <p className="confirm-text">
                Are you sure you want to delete <span className="confirm-name">{deletingUom.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </main>
  );
}
