'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AppLoader from '@/components/AppLoader';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
};

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = { name: '', description: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleActive = async (category: Category) => {
    setTogglingId(category._id);
    try {
      await fetchWithAuth(`/api/admin/categories/${category._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      fetchCategories();
    } catch (err) {
      console.error('Failed to toggle category', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetchWithAuth(`/api/admin/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Failed to delete category', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
        try {
        await fetchWithAuth('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm(EMPTY_FORM);
        setShowForm(false);
        fetchCategories();
    } catch (err) {
        console.error('Failed to create category', err);
        setError('Failed to create category. ' + (err instanceof Error ? err.message : ''));
    }finally
    {
        setSubmitting(false);
    }
    

  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <AppLoader label="Loading categories" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Admin</p>
          <h1 className="mt-4 text-3xl font-display text-(--luxe-text)">Categories</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setError(null); }}
          className="flex items-center gap-2 bg-(--luxe-cta) text-(--luxe-white) px-6 py-3 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Create panel */}
      {showForm && (
        <div className="mb-6 bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-[0.18em] uppercase text-(--luxe-text)">New Category</h2>
            <button onClick={() => setShowForm(false)} className="text-(--luxe-text-muted) hover:text-(--luxe-text)">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.18em] uppercase text-(--luxe-text-muted) mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-transparent border-b border-(--luxe-outline-light) py-2 text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary)"
                placeholder="e.g. Watches"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.18em] uppercase text-(--luxe-text-muted) mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-transparent border-b border-(--luxe-outline-light) py-2 text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary)"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs tracking-[0.18em] uppercase text-(--luxe-text-muted)">Active</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative w-11 h-6 transition-colors duration-200 focus:outline-none ${form.isActive ? 'bg-(--luxe-primary)' : 'bg-(--luxe-outline-light)'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-(--luxe-white) transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {error && <p className="text-xs text-(--luxe-error) tracking-[0.12em]">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-(--luxe-cta) text-(--luxe-white) px-6 py-2 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-(--luxe-outline-light) text-(--luxe-text-muted) px-6 py-2 text-xs tracking-[0.24em] uppercase hover:border-(--luxe-text) hover:text-(--luxe-text) transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      <div className="overflow-hidden border border-(--luxe-outline-light) bg-(--luxe-white)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left border-collapse">
          <thead>
            <tr className="bg-(--luxe-background) text-(--luxe-text-muted) text-xs tracking-[0.24em] uppercase border-b border-(--luxe-outline-light)">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium hidden sm:table-cell">Slug</th>
              <th className="p-4 font-medium hidden md:table-cell">Description</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--luxe-outline-light) text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-(--luxe-text-muted)">No categories yet.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-(--luxe-surface) transition-colors">
                  <td className="p-4 text-(--luxe-text) font-medium">{cat.name}</td>
                  <td className="p-4 font-mono text-xs text-(--luxe-text-muted) hidden sm:table-cell">{cat.slug}</td>
                  <td className="p-4 text-(--luxe-text-muted) text-xs hidden md:table-cell">{cat.description || '—'}</td>
                  <td className="p-4">
                    <button
                      disabled={togglingId === cat._id}
                      onClick={() => handleToggleActive(cat)}
                      className={`text-[11px] tracking-[0.18em] uppercase border px-2 py-1 transition-colors disabled:opacity-50 ${
                        cat.isActive
                          ? 'text-(--luxe-primary) border-(--luxe-primary) hover:bg-(--luxe-primary-container)'
                          : 'text-(--luxe-error) border-(--luxe-error) hover:bg-(--luxe-surface)'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={deletingId === cat._id}
                      onClick={() => handleDelete(cat._id)}
                      className="text-(--luxe-text-muted) hover:text-(--luxe-error) transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
