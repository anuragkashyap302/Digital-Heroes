import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Edit, Trash2, Sparkles, Globe, Calendar, Heart } from 'lucide-react';

export const CharityManagementTab = () => {
  const notify = useNotification();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Youth & Education',
    tagline: '',
    description: '',
    logo_url: '',
    banner_url: '',
    website_url: '',
    is_featured: false
  });
  const [saving, setSaving] = useState(false);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/charities');
      setCharities(res.charities || []);
    } catch (err) {
      notify.error('Failed to load charities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleOpenCreate = () => {
    setEditingCharity(null);
    setFormData({
      name: '',
      category: 'Youth & Education',
      tagline: '',
      description: '',
      logo_url: 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      website_url: '',
      is_featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name || '',
      category: charity.category || 'Youth & Education',
      tagline: charity.tagline || '',
      description: charity.description || '',
      logo_url: charity.logo_url || '',
      banner_url: charity.banner_url || '',
      website_url: charity.website_url || '',
      is_featured: !!charity.is_featured
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCharity) {
        await api.put(`/admin/charities/${editingCharity.id}`, formData);
        notify.success('Charity updated successfully.');
      } else {
        await api.post('/admin/charities', formData);
        notify.success('New charity created.');
      }
      setIsModalOpen(false);
      await fetchCharities();
    } catch (err) {
      notify.error(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charity?')) return;
    try {
      await api.delete(`/admin/charities/${id}`);
      notify.success('Charity deleted.');
      await fetchCharities();
    } catch (err) {
      notify.error(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            Charity & Philanthropy Management
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Add partner charities, update profile media, toggle featured causes, and track contributions.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Add New Charity</span>
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading charity directory..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((c) => (
            <Card key={c.id} className="p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-pine uppercase tracking-wider">{c.category}</span>
                  {c.is_featured && <Badge variant="gold" size="sm">Featured</Badge>}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-sage/30 shrink-0">
                    <img src={c.logo_url} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-ink leading-snug">{c.name}</h4>
                  </div>
                </div>

                <p className="text-xs text-ink-muted line-clamp-2 mt-2">{c.tagline || c.description}</p>

                <div className="mt-4 pt-3 border-t border-sage-light flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Total Raised:</span>
                  <strong className="font-serif text-base font-bold text-pine">
                    £{parseFloat(c.total_raised || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-sage-light flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)} className="text-xs gap-1 py-1.5 px-3">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-xs text-rose-700 hover:bg-rose-50 py-1.5 px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCharity ? "Edit Charitable Organization" : "Register New Charity"}
          subtitle="Configure charity profile, media assets, and featured placement."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
                >
                  <option value="Youth & Education">Youth & Education</option>
                  <option value="Environmental Protection">Environmental Protection</option>
                  <option value="Veterans & Mental Health">Veterans & Mental Health</option>
                  <option value="Medical & Health Research">Medical & Health Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.org"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">Short Tagline *</label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">Full Description / Mission *</label>
              <textarea
                rows="3"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Logo Image URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-pine rounded"
              />
              <span className="text-xs font-bold text-ink">Set as Featured Cause on Homepage</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-light">
              <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="md" loading={saving}>Save Charity</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
