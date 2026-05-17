'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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
        <div className="animate-spin h-8 w-8 border-2 border-[#d0c5af] border-t-[#d4af37]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Admin</p>
          <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18]">Categories</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setError(null); }}
          className="flex items-center gap-2 bg-[#d4af37] text-[#1c1c18] px-6 py-3 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Create panel */}
      {showForm && (
        <div className="mb-6 bg-[#ffffff] border border-[#d4af37] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-[0.18em] uppercase text-[#1c1c18]">New Category</h2>
            <button onClick={() => setShowForm(false)} className="text-[#7f7663] hover:text-[#1c1c18]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.18em] uppercase text-[#7f7663] mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-transparent border-b border-[#d0c5af] py-2 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                placeholder="e.g. Watches"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.18em] uppercase text-[#7f7663] mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-transparent border-b border-[#d0c5af] py-2 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs tracking-[0.18em] uppercase text-[#7f7663]">Active</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative w-11 h-6 transition-colors duration-200 focus:outline-none ${form.isActive ? 'bg-[#d4af37]' : 'bg-[#d0c5af]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white transition-transform duration-200 ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {error && <p className="text-xs text-[#8f0402] tracking-[0.12em]">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#d4af37] text-[#1c1c18] px-6 py-2 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-[#d0c5af] text-[#7f7663] px-6 py-2 text-xs tracking-[0.24em] uppercase hover:border-[#1c1c18] hover:text-[#1c1c18] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      <div className="bg-[#ffffff] border border-[#d0c5af] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fcf9f3] text-[#7f7663] text-xs tracking-[0.24em] uppercase border-b border-[#d0c5af]">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium hidden sm:table-cell">Slug</th>
              <th className="p-4 font-medium hidden md:table-cell">Description</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d0c5af] text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-[#7f7663]">No categories yet.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-[#f6f3ed] transition-colors">
                  <td className="p-4 text-[#1c1c18] font-medium">{cat.name}</td>
                  <td className="p-4 font-mono text-xs text-[#4d4635] hidden sm:table-cell">{cat.slug}</td>
                  <td className="p-4 text-[#7f7663] text-xs hidden md:table-cell">{cat.description || '—'}</td>
                  <td className="p-4">
                    <button
                      disabled={togglingId === cat._id}
                      onClick={() => handleToggleActive(cat)}
                      className={`text-[11px] tracking-[0.18em] uppercase border px-2 py-1 transition-colors disabled:opacity-50 ${
                        cat.isActive
                          ? 'text-[#2f6f44] border-[#2f6f44] hover:bg-[#f0faf4]'
                          : 'text-[#8f0402] border-[#8f0402] hover:bg-[#fff5f5]'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={deletingId === cat._id}
                      onClick={() => handleDelete(cat._id)}
                      className="text-[#7f7663] hover:text-[#8f0402] transition-colors disabled:opacity-30"
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
  );
}
