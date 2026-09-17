import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Search, UserCheck, Edit, Target, Shield, Check } from 'lucide-react';

export const UserManagementTab = () => {
  const notify = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingScore, setEditingScore] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/admin/users?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedRole) url += `role=${encodeURIComponent(selectedRole)}&`;

      const res = await api.get(url);
      setUsers(res.users || []);
    } catch (err) {
      notify.error(err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        role: editingUser.role,
        handicap: parseFloat(editingUser.handicap),
        full_name: editingUser.full_name,
        charity_contribution_percent: parseFloat(editingUser.charity_contribution_percent)
      });
      notify.success('User profile updated successfully.');
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      notify.error(err.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleOverrideScore = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/scores/${editingScore.id}`, {
        userId: editingScore.user_id,
        score: parseInt(editingScore.score, 10),
        played_at: editingScore.played_at,
        course_name: editingScore.course_name,
        notes: editingScore.notes
      });
      notify.success('Golf score successfully overridden by administrator.');
      setEditingScore(null);
      await fetchUsers();
    } catch (err) {
      notify.error(err.message || 'Failed to override score.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search users by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['', 'subscriber', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedRole === role
                  ? 'bg-pine text-canvas'
                  : 'bg-white text-ink-muted hover:text-ink border border-sage/30'
              }`}
            >
              {role || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : users.length === 0 ? (
        <EmptyState title="No Users Found" description="No registered profiles match your search criteria." />
      ) : (
        <div className="bg-white rounded-3xl border border-sage/30 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas/60 text-ink-muted text-xs uppercase tracking-wider font-semibold border-b border-sage-light">
                <tr>
                  <th className="py-4 px-6">User / Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Handicap</th>
                  <th className="py-4 px-6">Subscription</th>
                  <th className="py-4 px-6">Scores</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-light">
                {users.map((u) => {
                  const sub = u.subscription;
                  const isSubActive = sub?.status === 'active';
                  const scoresList = Array.isArray(u.scores) ? u.scores : [];

                  return (
                    <tr key={u.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <strong className="font-serif text-base text-ink block">{u.full_name}</strong>
                          <span className="text-xs text-ink-muted">{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={u.role === 'admin' ? 'dark' : 'pine'} size="sm">
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 font-semibold text-ink">
                        {u.handicap || 18.0}
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={isSubActive ? 'success' : 'danger'} size="sm">
                          {sub?.status ? sub.status.toUpperCase() : 'NO SUB'}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-pine">{scoresList.length}/5</span>
                          <span className="text-xs text-ink-muted">scores</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                            className="text-xs py-1 px-2.5 gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit User</span>
                          </Button>

                          {scoresList.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingScore(scoresList[0])}
                              className="text-xs py-1 px-2.5 gap-1 text-pine"
                              title="Override latest score"
                            >
                              <Target className="w-3.5 h-3.5" />
                              <span>Score</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit User Profile"
          subtitle={`Administrator update for ${editingUser.email}`}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={editingUser.full_name}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Administrator</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Handicap Index</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingUser.handicap}
                  onChange={(e) => setEditingUser({ ...editingUser, handicap: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-light">
              <Button variant="ghost" size="md" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="md" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Score Override Modal */}
      {editingScore && (
        <Modal
          isOpen={!!editingScore}
          onClose={() => setEditingScore(null)}
          title="Administrator Score Override"
          subtitle="Directly adjust a subscriber's Stableford score (1–45 points)."
        >
          <form onSubmit={handleOverrideScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Points (1-45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={editingScore.score}
                  onChange={(e) => setEditingScore({ ...editingScore, score: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-lg font-bold font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase mb-1">Date Played</label>
                <input
                  type="date"
                  value={editingScore.played_at ? editingScore.played_at.split('T')[0] : ''}
                  onChange={(e) => setEditingScore({ ...editingScore, played_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">Course Name</label>
              <input
                type="text"
                value={editingScore.course_name || ''}
                onChange={(e) => setEditingScore({ ...editingScore, course_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-light">
              <Button variant="ghost" size="md" onClick={() => setEditingScore(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="md" loading={saving}>Commit Score Override</Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
