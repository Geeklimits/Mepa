
import React, { useState } from 'react';
import { LogType } from '../types';

interface Role {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface RolesViewProps {
  onLog: (type: LogType, action: string, target: string, reason?: string) => void;
}

const RolesView: React.FC<RolesViewProps> = ({ onLog }) => {
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Verified Bestie', emoji: '💖', color: '#ec4899' },
    { id: '2', name: 'VIP Luxury', emoji: '🥂', color: '#a855f7' },
    { id: '3', name: 'Drama Alert', emoji: '☕', color: '#f59e0b' },
  ]);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleEmoji, setNewRoleEmoji] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleEmoji.trim()) {
      alert("Ugh, you literally left a field empty. My eyes are rolling so hard right now. 🙄");
      return;
    }

    const newRole: Role = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      emoji: newRoleEmoji.trim(),
      color: '#94a3b8',
    };

    setRoles([...roles, newRole]);
    onLog('role', 'Created', newRole.name, `Added new reaction role with emoji ${newRole.emoji}`);

    // Reset state
    setNewRoleName('');
    setNewRoleEmoji('');
    setIsAdding(false);
  };

  const removeRole = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? It's giving "burned bridges" energy.`)) {
      setRoles(roles.filter(r => r.id !== id));
      onLog('role', 'Removed', name, 'Reaction role deleted by admin.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header & Toggle Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Reaction Roles</h3>
            <p className="text-slate-500 text-sm">Let them pick their own vibe. 🎭</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isAdding
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-slate-900 text-white hover:bg-black'
              }`}
          >
            {isAdding ? 'Cancel' : 'Create New +'}
          </button>
        </div>

        {/* Add Role Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleAddRole}
            className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Main Character"
                  className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Emoji</label>
                <input
                  type="text"
                  value={newRoleEmoji}
                  onChange={(e) => setNewRoleEmoji(e.target.value)}
                  placeholder="e.g. ✨"
                  className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all text-sm font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-pink-500 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 active:scale-[0.98]"
            >
              Add to Elite List 💅
            </button>
          </form>
        )}

        {/* Role List */}
        <div className="space-y-4">
          {roles.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4 grayscale opacity-30">😶</span>
              <p className="text-slate-400 text-sm italic font-medium">No roles. Everyone is a generic guest. Tragic. 🙄</p>
            </div>
          ) : (
            roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-pink-200 transition-colors group">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                    {role.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{role.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Emoji: {role.emoji}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => removeRole(role.id, role.name)}
                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-pink-50/50 p-8 rounded-[2rem] border border-pink-100 flex items-start space-x-5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-pink-100 shrink-0">💅</div>
        <div className="text-sm text-pink-700 leading-relaxed">
          <p className="font-bold mb-1 uppercase tracking-widest text-xs">Administrative Tip:</p>
          Make sure Mepa's role is higher in the hierarchy than the roles she's giving out. Otherwise, she literally can't help you, and it's awkward for everyone. Period.
        </div>
      </div>
    </div>
  );
};

export default RolesView;
