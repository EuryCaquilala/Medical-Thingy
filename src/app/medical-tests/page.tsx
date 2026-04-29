'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  getMedicalTests, searchMedicalTests, createMedicalTest,
  updateMedicalTest, deleteMedicalTest, getUomsForSelect, getCategoriesForSelect,
} from '@/app/actions/medicalTestActions';

type MedicalTest = {
  id: bigint; name: string; description: string | null;
  iduom: bigint | null; idcategory: bigint | null;
  normalmin: number | null; normalmax: number | null;
  uomName: string; categoryName: string;
};
type SelectOption = { id: bigint; name: string };

export default function MedicalTestsPage() {
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [uoms, setUoms] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTest, setEditingTest] = useState<MedicalTest | null>(null);
  const [deletingTest, setDeletingTest] = useState<MedicalTest | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const data = searchQuery ? await searchMedicalTests(searchQuery) : await getMedicalTests();
      setTests(data);
    });
  };

  const loadSelects = async () => {
    const [u, c] = await Promise.all([getUomsForSelect(), getCategoriesForSelect()]);
    setUoms(u); setCategories(c);
  };

  useEffect(() => { loadData(); }, [searchQuery]);
  useEffect(() => { loadSelects(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingTest) {
        formData.append('id', editingTest.id.toString());
        await updateMedicalTest(formData);
        showToast('Medical test updated!', 'success');
      } else {
        await createMedicalTest(formData);
        showToast('Medical test created!', 'success');
      }
      setShowModal(false); loadData();
    } catch { showToast('Error occurred.', 'error'); }
  };

  const handleDelete = async () => {
    if (!deletingTest) return;
    try {
      await deleteMedicalTest(deletingTest.id);
      showToast('Medical test deleted!', 'success');
      setShowDeleteConfirm(false); setDeletingTest(null); loadData();
    } catch { showToast('Error deleting test.', 'error'); }
  };

  const openCreate = () => { setEditingTest(null); setShowModal(true); };
  const openEdit = (t: MedicalTest) => { setEditingTest(t); setShowModal(true); };
  const openDelete = (t: MedicalTest) => { setDeletingTest(t); setShowDeleteConfirm(true); };

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Medical Tests</h1>
        <p className="page-subtitle">Manage medical tests with linked categories and units (JOIN view)</p>
      </div>
      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input id="search-tests" type="text" className="search-input" placeholder="Search tests, categories, units..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button id="btn-create-test" className="btn btn-primary" onClick={openCreate}>+ Add Test</button>
      </div>
      <div className="table-card">
        {tests.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr>
                <th>ID</th><th>Test Name</th><th>Category</th><th>Unit</th><th>Normal Range</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id.toString()}>
                    <td>{t.id.toString()}</td>
                    <td className="td-name">{t.name}</td>
                    <td><span className="badge badge-category">{t.categoryName}</span></td>
                    <td><span className="badge badge-uom">{t.uomName}</span></td>
                    <td>
                      <div className="range-display">
                        <span className="range-min">{t.normalmin ?? '—'}</span>
                        <span className="range-sep">–</span>
                        <span className="range-max">{t.normalmax ?? '—'}</span>
                      </div>
                    </td>
                    <td><div className="td-actions">
                      <button className="btn btn-edit" onClick={() => openEdit(t)}>✏️ Edit</button>
                      <button className="btn btn-delete" onClick={() => openDelete(t)}>🗑️ Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🧪</div>
            <p className="empty-title">No medical tests found</p>
            <p className="empty-text">{searchQuery ? 'Try a different search.' : 'Create your first medical test.'}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTest ? 'Edit Medical Test' : 'New Medical Test'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form action={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="test-name">Test Name</label>
                  <input id="test-name" name="name" type="text" className="form-input" defaultValue={editingTest?.name || ''} required maxLength={50} placeholder="e.g. Fasting Blood Glucose" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="test-desc">Description</label>
                  <textarea id="test-desc" name="description" className="form-textarea" defaultValue={editingTest?.description || ''} placeholder="Optional description..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="test-category">Category</label>
                    <select id="test-category" name="idcategory" className="form-select" defaultValue={editingTest?.idcategory?.toString() || ''}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c.id.toString()} value={c.id.toString()}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="test-uom">Unit of Measure</label>
                    <select id="test-uom" name="iduom" className="form-select" defaultValue={editingTest?.iduom?.toString() || ''}>
                      <option value="">Select unit</option>
                      {uoms.map((u) => <option key={u.id.toString()} value={u.id.toString()}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="test-min">Normal Min</label>
                    <input id="test-min" name="normalmin" type="number" step="any" className="form-input" defaultValue={editingTest?.normalmin ?? ''} placeholder="e.g. 70" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="test-max">Normal Max</label>
                    <input id="test-max" name="normalmax" type="number" step="any" className="form-input" defaultValue={editingTest?.normalmax ?? ''} placeholder="e.g. 99" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? 'Saving...' : editingTest ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingTest && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-icon">⚠️</div>
              <p className="confirm-text">Delete <span className="confirm-name">{deletingTest.name}</span>? This cannot be undone.</p>
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
