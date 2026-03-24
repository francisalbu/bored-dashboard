import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Hotel,
  Building2,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Trash2,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  X,
  Copy,
  Check,
  KeyRound,
  SendHorizonal,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  fetchAllDashboardUsers,
  fetchAllHotelsWithUsers,
  fetchPendingInvites,
  fetchHotelGroups,
  assignUserToHotel,
  removeUserFromHotel,
  updateUserHotelRole,
  updateDashboardUserRole,
  createInvite,
  revokeInvite,
  createHotelGroup,
  assignHotelToGroup,
  createDashboardUser,
  sendPasswordReset,
  type CreateUserParams,
  type DashboardUser,
  type HotelWithUsers,
  type PendingInvite,
  type HotelGroup,
} from '../../lib/adminService';

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'hotels' | 'users' | 'invites' | 'groups';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'hotels', label: 'Hotels', icon: <Hotel size={15} /> },
  { id: 'users', label: 'Users', icon: <Users size={15} /> },
  { id: 'invites', label: 'Invites', icon: <Mail size={15} /> },
  { id: 'groups', label: 'Groups', icon: <Building2 size={15} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role badge
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  hotel_admin: 'bg-blue-100 text-blue-700',
  owner: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-bored-gray-100 text-bored-gray-600',
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${ROLE_COLORS[role] ?? 'bg-bored-gray-100 text-bored-gray-600'}`}>
    {role === 'super_admin' && <ShieldCheck size={10} />}
    {(role === 'hotel_admin' || role === 'admin' || role === 'owner') && <Shield size={10} />}
    {role.replace('_', ' ')}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pill button
// ─────────────────────────────────────────────────────────────────────────────

const Btn = ({ children, onClick, variant = 'default', disabled = false, small = false, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'primary' | 'ghost';
  disabled?: boolean;
  small?: boolean;
  className?: string;
}) => {
  const base = `inline-flex items-center gap-1.5 font-medium rounded-lg transition-all ${small ? 'text-xs px-2.5 py-1' : 'text-sm px-3.5 py-2'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;
  const variants: Record<string, string> = {
    default: 'bg-bored-gray-100 text-bored-gray-700 hover:bg-bored-gray-200',
    primary: 'bg-bored-black text-white hover:bg-bored-gray-900',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-bored-gray-500 hover:text-bored-black hover:bg-bored-gray-50',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hotels tab
// ─────────────────────────────────────────────────────────────────────────────

const HotelsTab: React.FC<{
  hotels: HotelWithUsers[];
  users: DashboardUser[];
  groups: HotelGroup[];
  onRefresh: () => void;
}> = ({ hotels, users, groups, onRefresh }) => {
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null); // hotel_id
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'staff'>('admin');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ hotelId: string; msg: string } | null>(null);

  const handleAssign = async () => {
    if (!assignModal || !selectedUserId) return;
    setSaving(true);
    const res = await assignUserToHotel(selectedUserId, assignModal, selectedRole);
    setSaving(false);
    if (res.success) {
      setAssignModal(null);
      setSelectedUserId('');
      onRefresh();
    } else {
      setFeedback({ hotelId: assignModal, msg: res.error || 'Error' });
    }
  };

  const handleRemove = async (userId: string, hotelId: string) => {
    const res = await removeUserFromHotel(userId, hotelId);
    if (res.success) onRefresh();
  };

  const handleRoleChange = async (userId: string, hotelId: string, role: 'owner' | 'admin' | 'staff') => {
    await updateUserHotelRole(userId, hotelId, role);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {hotels.map(hotel => (
        <div key={hotel.id} className="border border-bored-gray-200 rounded-2xl overflow-hidden bg-white">
          {/* Hotel header row */}
          <button
            onClick={() => setExpandedHotel(expandedHotel === hotel.id ? null : hotel.id)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bored-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-bored-neon/20 flex items-center justify-center flex-shrink-0">
              <Hotel size={16} className="text-bored-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bored-black">{hotel.name}</p>
              <p className="text-xs text-bored-gray-400">
                {hotel.id}
                {hotel.group_name ? ` · ${hotel.group_name}` : ''}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hotel.users.length > 0 ? 'bg-bored-neon/20 text-bored-black' : 'bg-bored-gray-100 text-bored-gray-400'}`}>
              {hotel.users.length} {hotel.users.length === 1 ? 'user' : 'users'}
            </span>
            <ChevronDown size={15} className={`text-bored-gray-400 transition-transform ${expandedHotel === hotel.id ? 'rotate-180' : ''}`} />
          </button>

          {/* Expanded users */}
          {expandedHotel === hotel.id && (
            <div className="border-t border-bored-gray-100 px-5 pb-4">
              {hotel.users.length === 0 ? (
                <p className="text-xs text-bored-gray-400 py-3 text-center">No users assigned to this hotel yet.</p>
              ) : (
                <div className="divide-y divide-bored-gray-100">
                  {hotel.users.map(u => (
                    <div key={u.user_id} className="flex items-center gap-3 py-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center text-[11px] font-bold text-bored-black flex-shrink-0">
                        {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-bored-black truncate">{u.full_name || u.email}</p>
                        {u.full_name && <p className="text-[10px] text-bored-gray-400 truncate">{u.email}</p>}
                      </div>
                      {/* Role selector */}
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.user_id, hotel.id, e.target.value as any)}
                        className="text-xs border border-bored-gray-200 rounded-lg px-2 py-1 text-bored-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-bored-neon"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                      <button
                        onClick={() => handleRemove(u.user_id, hotel.id)}
                        className="p-1 text-bored-gray-300 hover:text-red-500 transition-colors rounded"
                        title="Remove from hotel"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Assign user */}
              {assignModal === hotel.id ? (
                <div className="mt-3 p-3 bg-bored-gray-50 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-bored-black">Assign user to {hotel.name}</p>
                  {feedback?.hotelId === hotel.id && (
                    <p className="text-xs text-red-500">{feedback.msg}</p>
                  )}
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full text-xs border border-bored-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-bored-neon"
                  >
                    <option value="">Select a user…</option>
                    {users
                      .filter(u => !hotel.users.some(hu => hu.user_id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                        </option>
                      ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value as any)}
                      className="flex-1 text-xs border border-bored-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-bored-neon"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                    <Btn variant="primary" small onClick={handleAssign} disabled={saving || !selectedUserId}>
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Assign
                    </Btn>
                    <Btn variant="ghost" small onClick={() => { setAssignModal(null); setSelectedUserId(''); }}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setAssignModal(hotel.id); setFeedback(null); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs text-bored-gray-500 hover:text-bored-black border border-dashed border-bored-gray-200 hover:border-bored-gray-400 rounded-xl transition-colors"
                >
                  <UserPlus size={13} />
                  Assign existing user
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Create User form (inline modal inside UsersTab)
// ─────────────────────────────────────────────────────────────────────────────

const CreateUserForm: React.FC<{
  hotels: HotelWithUsers[];
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ hotels, onSuccess, onCancel }) => {
  const [email, setEmail]           = useState('');
  const [fullName, setFullName]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [pwCopied, setPwCopied]     = useState(false);
  const [globalRole, setGlobalRole] = useState<'hotel_admin' | 'staff'>('hotel_admin');
  const [hotelId, setHotelId]       = useState('');
  const [hotelRole, setHotelRole]   = useState<'admin' | 'staff'>('admin');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setPwCopied(true);
      setTimeout(() => setPwCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setSaving(true);
    setError('');

    const params: CreateUserParams = {
      email:      email.trim(),
      fullName:   fullName.trim(),
      password:   password.trim(),
      globalRole,
      hotelId:    hotelId || undefined,
      hotelRole:  hotelId ? hotelRole : undefined,
    };

    const res = await createDashboardUser(params);
    setSaving(false);

    if (!res.success) {
      setError(res.error || 'Something went wrong');
      return;
    }

    setSuccess(`✓ ${email.trim()} created. Share the credentials manually.`);
    setTimeout(() => { onSuccess(); }, 2000);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-800 flex items-start gap-3">
        <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
        <span>{success}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-bored-gray-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bored-black flex items-center gap-2">
          <UserPlus size={15} className="text-bored-gray-500" />
          New dashboard user
        </h3>
        <button onClick={onCancel} className="text-bored-gray-300 hover:text-bored-black transition-colors">
          <X size={15} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-bored-gray-600 mb-1">Email address *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="patricia@hotel.com"
            className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-bored-gray-600 mb-1">Full name *</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Patricia Vieira"
            className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-bored-gray-600 mb-1">Temporary password *</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="p-1.5 text-bored-gray-300 hover:text-bored-black rounded-lg transition-colors">
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button type="button" onClick={copyPassword} title="Copy password"
                className="p-1.5 text-bored-gray-300 hover:text-bored-black rounded-lg transition-colors">
                {pwCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-bored-gray-400 mt-1">
            Share this with the user. They'll be asked to change it on first login.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-bored-gray-600 mb-1">Global role</label>
          <select
            value={globalRole}
            onChange={e => setGlobalRole(e.target.value as any)}
            className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
          >
            <option value="hotel_admin">Hotel Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-bored-gray-600 mb-1">Assign to hotel</label>
          <select
            value={hotelId}
            onChange={e => setHotelId(e.target.value)}
            className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
          >
            <option value="">None (assign later)</option>
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        {hotelId && (
          <div>
            <label className="block text-xs font-medium text-bored-gray-600 mb-1">Hotel role</label>
            <select
              value={hotelRole}
              onChange={e => setHotelRole(e.target.value as any)}
              className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          {saving ? 'Creating…' : 'Create user'}
        </Btn>
        <Btn variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Btn>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Users tab
// ─────────────────────────────────────────────────────────────────────────────

const UsersTab: React.FC<{
  users: DashboardUser[];
  hotels: HotelWithUsers[];
  onRefresh: () => void;
}> = ({ users, hotels, onRefresh }) => {
  const [showCreate, setShowCreate]         = useState(false);
  const [resetSent, setResetSent]           = useState<string | null>(null);   // email that just got reset
  const [resetLoading, setResetLoading]     = useState<string | null>(null);

  const handleGlobalRoleChange = async (userId: string, role: 'super_admin' | 'hotel_admin' | 'staff') => {
    await updateDashboardUserRole(userId, role);
    onRefresh();
  };

  const handleRemoveFromHotel = async (userId: string, hotelId: string) => {
    await removeUserFromHotel(userId, hotelId);
    onRefresh();
  };

  const handleSendReset = async (email: string) => {
    setResetLoading(email);
    await sendPasswordReset(email);
    setResetLoading(null);
    setResetSent(email);
    setTimeout(() => setResetSent(null), 3000);
  };

  return (
    <div className="space-y-3">
      {/* Create user CTA */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-bored-gray-600 hover:text-bored-black border border-dashed border-bored-gray-200 hover:border-bored-gray-400 rounded-2xl transition-colors bg-white"
        >
          <UserPlus size={15} />
          Create new user
        </button>
      ) : (
        <CreateUserForm
          hotels={hotels}
          onSuccess={() => { setShowCreate(false); onRefresh(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {users.length === 0 && (
        <p className="text-sm text-center text-bored-gray-400 py-10">No users yet.</p>
      )}
      {users.map(user => (
        <div key={user.id} className="border border-bored-gray-200 rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bored-neon to-yellow-300 flex items-center justify-center text-sm font-bold text-bored-black flex-shrink-0">
              {(user.full_name || user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-bored-black truncate">
                  {user.full_name || '—'}
                </p>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-xs text-bored-gray-400 truncate">{user.email}</p>
            </div>
            {/* Global role selector */}
            <select
              value={user.role}
              onChange={e => handleGlobalRoleChange(user.id, e.target.value as any)}
              className="text-xs border border-bored-gray-200 rounded-lg px-2 py-1.5 text-bored-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-bored-neon"
            >
              <option value="super_admin">Super Admin</option>
              <option value="hotel_admin">Hotel Admin</option>
              <option value="staff">Staff</option>
            </select>
            {/* Send password reset */}
            <button
              onClick={() => handleSendReset(user.email)}
              disabled={resetLoading === user.email}
              title="Send password reset email"
              className="p-1.5 text-bored-gray-300 hover:text-bored-black hover:bg-bored-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {resetLoading === user.email
                ? <Loader2 size={14} className="animate-spin" />
                : resetSent === user.email
                  ? <Check size={14} className="text-green-500" />
                  : <KeyRound size={14} />
              }
            </button>
          </div>

          {/* Hotels assigned */}
          {user.hotels.length > 0 && (
            <div className="border-t border-bored-gray-100 px-5 py-3 flex flex-wrap gap-2">
              {user.hotels.map(h => (
                <span key={h.hotel_id} className="inline-flex items-center gap-1.5 bg-bored-gray-50 border border-bored-gray-200 rounded-lg px-2.5 py-1 text-xs text-bored-gray-700">
                  <Hotel size={10} className="text-bored-gray-400" />
                  {h.hotel_name}
                  <span className="text-bored-gray-400">·</span>
                  {h.role}
                  <button
                    onClick={() => handleRemoveFromHotel(user.id, h.hotel_id)}
                    className="ml-0.5 text-bored-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {user.hotels.length === 0 && (
            <div className="border-t border-bored-gray-100 px-5 py-2">
              <p className="text-xs text-bored-gray-400 italic">Not assigned to any hotel.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Invites tab
// ─────────────────────────────────────────────────────────────────────────────

const InvitesTab: React.FC<{
  invites: PendingInvite[];
  hotels: HotelWithUsers[];
  onRefresh: () => void;
}> = ({ invites, hotels, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!email.trim() || !hotelId) { setError('Fill all fields'); return; }
    setSaving(true);
    const res = await createInvite(email.trim(), hotelId, role);
    setSaving(false);
    if (res.success) {
      setShowForm(false);
      setEmail('');
      setHotelId('');
      setError('');
      onRefresh();
    } else {
      setError(res.error || 'Failed to create invite');
    }
  };

  const handleRevoke = async (id: string) => {
    await revokeInvite(id);
    onRefresh();
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(email);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="space-y-4">
      {/* Create invite CTA */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-bored-gray-600 hover:text-bored-black border border-dashed border-bored-gray-200 hover:border-bored-gray-400 rounded-2xl transition-colors bg-white"
        >
          <Plus size={15} />
          Invite a new user
        </button>
      ) : (
        <div className="bg-white border border-bored-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-bored-black">New Invite</h3>
            <button onClick={() => setShowForm(false)} className="text-bored-gray-300 hover:text-bored-black">
              <X size={15} />
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-bored-gray-600 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@hotel.com"
                className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-bored-gray-600 mb-1">Hotel</label>
                <select
                  value={hotelId}
                  onChange={e => setHotelId(e.target.value)}
                  className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
                >
                  <option value="">Select hotel…</option>
                  {hotels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-bored-gray-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Btn variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              Create invite
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Btn>
          </div>

          <p className="text-[11px] text-bored-gray-400 leading-relaxed">
            Once created, share the app URL with the user. When they sign up with this exact email address, they will be automatically assigned to the selected hotel.
          </p>
        </div>
      )}

      {/* Pending invites list */}
      {invites.length === 0 && !showForm && (
        <p className="text-sm text-center text-bored-gray-400 py-6">No pending invites.</p>
      )}

      {invites.map(inv => (
        <div key={inv.id} className="flex items-center gap-4 bg-white border border-bored-gray-200 rounded-2xl px-5 py-3.5">
          <div className="w-8 h-8 rounded-full bg-bored-gray-100 flex items-center justify-center flex-shrink-0">
            <Clock size={13} className="text-bored-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-bored-black truncate">{inv.email}</p>
            <p className="text-xs text-bored-gray-400">
              {inv.hotel_name} · <RoleBadge role={inv.role} /> · sent {new Date(inv.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleCopyEmail(inv.email)}
            className="p-1.5 text-bored-gray-300 hover:text-bored-black transition-colors rounded-lg hover:bg-bored-gray-50"
            title="Copy email"
          >
            {copied === inv.email ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
          <button
            onClick={() => handleRevoke(inv.id)}
            className="p-1.5 text-bored-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Revoke invite"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Groups tab
// ─────────────────────────────────────────────────────────────────────────────

const GroupsTab: React.FC<{
  groups: HotelGroup[];
  hotels: HotelWithUsers[];
  onRefresh: () => void;
}> = ({ groups, hotels, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) { setError('Name and slug required'); return; }
    setSaving(true);
    const res = await createHotelGroup(name.trim(), slug.trim());
    setSaving(false);
    if (res.success) {
      setShowForm(false);
      setName('');
      setSlug('');
      setError('');
      onRefresh();
    } else {
      setError(res.error || 'Failed');
    }
  };

  const hotelsInGroup = (groupId: string) => hotels.filter(h => h.group_id === groupId);
  const unassignedHotels = hotels.filter(h => !h.group_id);

  const handleGroupChange = async (hotelId: string, gid: string) => {
    await assignHotelToGroup(hotelId, gid || null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Create group CTA */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-bored-gray-600 hover:text-bored-black border border-dashed border-bored-gray-200 hover:border-bored-gray-400 rounded-2xl transition-colors bg-white"
        >
          <Plus size={15} />
          Create new group
        </button>
      ) : (
        <div className="bg-white border border-bored-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-bored-black">New Hotel Group</h3>
            <button onClick={() => setShowForm(false)} className="text-bored-gray-300 hover:text-bored-black"><X size={15} /></button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-bored-gray-600 mb-1">Group name</label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
                placeholder="Lisbon Hostels Group"
                className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-bored-gray-600 mb-1">Slug (URL-safe)</label>
              <input
                value={slug}
                onChange={e => setSlug(slugify(e.target.value))}
                placeholder="lisbon-hostels"
                className="w-full text-sm border border-bored-gray-200 rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-bored-neon/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Create group
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.map(group => (
        <div key={group.id} className="border border-bored-gray-200 rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-bored-gray-50/50">
            <Building2 size={16} className="text-bored-gray-500" />
            <div>
              <p className="text-sm font-semibold text-bored-black">{group.name}</p>
              <p className="text-[11px] text-bored-gray-400 font-mono">{group.slug}</p>
            </div>
            <span className="ml-auto text-xs text-bored-gray-400">{hotelsInGroup(group.id).length} hotels</span>
          </div>
          <div className="divide-y divide-bored-gray-100">
            {hotelsInGroup(group.id).map(hotel => (
              <div key={hotel.id} className="flex items-center gap-3 px-5 py-2.5">
                <Hotel size={13} className="text-bored-gray-400 flex-shrink-0" />
                <p className="flex-1 text-sm text-bored-gray-700">{hotel.name}</p>
                <button
                  onClick={() => handleGroupChange(hotel.id, '')}
                  className="text-[11px] text-bored-gray-400 hover:text-red-500 transition-colors px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Unassigned hotels */}
      {unassignedHotels.length > 0 && (
        <div className="border border-dashed border-bored-gray-200 rounded-2xl bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-dashed border-bored-gray-200">
            <p className="text-xs font-semibold text-bored-gray-400 uppercase tracking-wider">Not in a group</p>
          </div>
          <div className="divide-y divide-bored-gray-100">
            {unassignedHotels.map(hotel => (
              <div key={hotel.id} className="flex items-center gap-3 px-5 py-2.5">
                <Hotel size={13} className="text-bored-gray-300 flex-shrink-0" />
                <p className="flex-1 text-sm text-bored-gray-600">{hotel.name}</p>
                {groups.length > 0 && (
                  <select
                    value=""
                    onChange={e => e.target.value && handleGroupChange(hotel.id, e.target.value)}
                    className="text-xs border border-bored-gray-200 rounded-lg px-2 py-1 bg-white text-bored-gray-600 focus:outline-none focus:ring-1 focus:ring-bored-neon"
                  >
                    <option value="">Assign to group…</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export const SuperAdminView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('hotels');
  const [hotels, setHotels] = useState<HotelWithUsers[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [groups, setGroups] = useState<HotelGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [h, u, i, g] = await Promise.all([
      fetchAllHotelsWithUsers(),
      fetchAllDashboardUsers(),
      fetchPendingInvites(),
      fetchHotelGroups(),
    ]);
    setHotels(h);
    setUsers(u);
    setInvites(i);
    setGroups(g);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tabCounts: Record<Tab, number> = {
    hotels: hotels.length,
    users: users.length,
    invites: invites.length,
    groups: groups.length,
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-bored-black">Admin Panel</h1>
          <p className="text-sm text-bored-gray-400 mt-0.5">Manage hotels, users, and access</p>
        </div>
        <button
          onClick={loadAll}
          className="p-2 text-bored-gray-400 hover:text-bored-black hover:bg-bored-gray-100 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-bored-gray-100 rounded-2xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-xl transition-all ${
              tab === t.id
                ? 'bg-white text-bored-black shadow-sm'
                : 'text-bored-gray-500 hover:text-bored-black'
            }`}
          >
            {t.icon}
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.id ? 'bg-bored-neon/30 text-bored-black' : 'bg-bored-gray-200 text-bored-gray-500'
              }`}>
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-bored-gray-300" />
        </div>
      ) : (
        <>
          {tab === 'hotels' && <HotelsTab hotels={hotels} users={users} groups={groups} onRefresh={loadAll} />}
          {tab === 'users' && <UsersTab users={users} hotels={hotels} onRefresh={loadAll} />}
          {tab === 'invites' && <InvitesTab invites={invites} hotels={hotels} onRefresh={loadAll} />}
          {tab === 'groups' && <GroupsTab groups={groups} hotels={hotels} onRefresh={loadAll} />}
        </>
      )}
    </div>
  );
};
