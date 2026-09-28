import React, { useState, useMemo } from 'react';
import {
  User,
  Plus,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  Check,
  Edit2,
  Save,
  X,
  AlertCircle,
  Award,
  Layers,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { PROFICIENCY_LABELS } from '../types/profile';

const PROFICIENCY_COLORS: Record<number, { bg: string; text: string; border: string; bar: string }> = {
  0: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-700', bar: '#64748b' },
  1: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', bar: '#38bdf8' },
  2: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: '#34d399' },
  3: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: '#a78bfa' },
  4: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: '#f59e0b' },
};

export const ProfilePage: React.FC = () => {
  const {
    profile,
    skills,
    availableSkills,
    loading,
    saving,
    error,
    addSkill,
    changeProficiency,
    removeSkill,
    saveProfileInfo,
  } = useProfile(1);

  // Form states
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [customSkillName, setCustomSkillName] = useState<string>('');
  const [newProficiency, setNewProficiency] = useState<number>(2); // default Intermediate
  const [inputMode, setInputMode] = useState<'picker' | 'custom'>('picker');
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProficiencyFilter, setSelectedProficiencyFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Handle Edit Profile
  const handleStartEdit = () => {
    if (profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) return;
    const ok = await saveProfileInfo(editName.trim(), editEmail.trim());
    if (ok) {
      setIsEditingProfile(false);
    }
  };

  // Handle Add Skill
  const handleAddSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;

    if (inputMode === 'picker') {
      if (!selectedSkillId) return;
      success = await addSkill({ skill_id: Number(selectedSkillId) }, newProficiency);
      if (success) {
        setSelectedSkillId('');
        setAddFeedback('Skill added successfully!');
        setTimeout(() => setAddFeedback(null), 3000);
      }
    } else {
      if (!customSkillName.trim()) return;
      success = await addSkill({ skill_name: customSkillName.trim() }, newProficiency);
      if (success) {
        setCustomSkillName('');
        setAddFeedback('Skill canonicalized & added successfully!');
        setTimeout(() => setAddFeedback(null), 3000);
      }
    }
  };

  // Filter available skills that are not already added
  const unaddedSkills = useMemo(() => {
    const existingIds = new Set(skills.map((s) => s.skill_id));
    return availableSkills.filter((s) => !existingIds.has(s.id));
  }, [availableSkills, skills]);

  // Categories present in cataloged skills
  const skillCategories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category || 'General'));
    return ['all', ...Array.from(cats).sort()];
  }, [skills]);

  // Filtered skills list
  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchProf =
        selectedProficiencyFilter === 'all' ||
        item.proficiency === Number(selectedProficiencyFilter);

      const matchCat =
        selectedCategoryFilter === 'all' ||
        (item.category && item.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

      return matchSearch && matchProf && matchCat;
    });
  }, [skills, searchQuery, selectedProficiencyFilter, selectedCategoryFilter]);

  // Statistics
  const proficiencyCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    skills.forEach((s) => {
      if (counts[s.proficiency] !== undefined) {
        counts[s.proficiency]++;
      }
    });
    return counts;
  }, [skills]);

  const avgProficiency =
    skills.length > 0
      ? (skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length).toFixed(1)
      : '0.0';

  return (
    <div className="py-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <User className="w-3.5 h-3.5" />
            <span>Phase 9 — User Skill Profile & Proficiency Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personal Skill Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            Maintain your technical competencies and realistic proficiency levels (None to Expert)
            to power deterministic skill gap calculations in Phase 10.
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Cataloged Profile</div>
            <div className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <span>{skills.length} Skills</span>
              <span className="text-xs font-normal text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Avg: Level {avgProficiency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Info Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            {isEditingProfile ? (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Email"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                  title="Save Profile"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {profile?.name || 'Default Developer'}
                </h2>
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Edit Name & Email"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.email || 'developer@example.com'} • User ID #{profile?.id || 1}
            </p>
          </div>
        </div>

        {/* Proficiency Breakdown Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[4, 3, 2, 1, 0].map((lvl) => {
            const meta = PROFICIENCY_LABELS[lvl];
            const colors = PROFICIENCY_COLORS[lvl];
            return (
              <div
                key={lvl}
                className={`px-3 py-1.5 rounded-xl border ${colors.border} ${colors.bg} flex items-center gap-2`}
              >
                <span className={`font-bold ${colors.text}`}>{meta.short} ({lvl})</span>
                <span className="font-mono text-white text-xs font-semibold">
                  {proficiencyCounts[lvl] || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proficiency Scale Reference (Section 28 Standard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[0, 1, 2, 3, 4].map((lvl) => {
          const info = PROFICIENCY_LABELS[lvl];
          const colors = PROFICIENCY_COLORS[lvl];
          return (
            <div
              key={lvl}
              className={`p-3.5 rounded-xl border ${colors.border} bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${colors.text}`}>
                    Level {lvl} — {info.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{info.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Skill Panel */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Skill to Profile</h3>
              <p className="text-xs text-slate-400">
                Choose from canonical taxonomy or type any natural alias (e.g. "postgres", "node.js", "k8s").
              </p>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('picker')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                inputMode === 'picker'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              From Taxonomy
            </button>
            <button
              type="button"
              onClick={() => setInputMode('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                inputMode === 'custom'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Natural Alias Entry
            </button>
          </div>
        </div>

        <form onSubmit={handleAddSkillSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Skill Selector / Input */}
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {inputMode === 'picker' ? 'Select Standardized Skill' : 'Enter Skill or Alias'}
              </label>
              {inputMode === 'picker' ? (
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">-- Choose a skill from catalog ({unaddedSkills.length} available) --</option>
                  {unaddedSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category || 'General'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Postgres, NextJS, K8s, Golang, PyTorch..."
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              )}
            </div>

            {/* Proficiency Selector (0 to 4) */}
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Proficiency Level (0 = None → 4 = Expert)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((lvl) => {
                  const meta = PROFICIENCY_LABELS[lvl];
                  const colors = PROFICIENCY_COLORS[lvl];
                  const isSelected = newProficiency === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewProficiency(lvl)}
                      className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${colors.border} ${colors.bg} ${colors.text} font-bold ring-1 ring-cyan-500 shadow-md`
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-mono">{lvl}</div>
                      <div className="text-[10px] truncate">{meta.short}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Section 28 Standard: Values 0–4 drive Gap Priority (High/Med/Low) in Phase 10.</span>
            </div>

            <div className="flex items-center gap-3">
              {addFeedback && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {addFeedback}
                </span>
              )}
              <button
                type="submit"
                disabled={saving || (inputMode === 'picker' ? !selectedSkillId : !customSkillName.trim())}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Add to Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cataloged Skills Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Your Cataloged Skills ({filteredSkills.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any level button directly on a skill row to update proficiency instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Proficiency Filter */}
            <select
              value={selectedProficiencyFilter}
              onChange={(e) => setSelectedProficiencyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="4">Level 4 (Expert)</option>
              <option value="3">Level 3 (Advanced)</option>
              <option value="2">Level 2 (Intermediate)</option>
              <option value="1">Level 1 (Beginner)</option>
              <option value="0">Level 0 (None)</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer capitalize"
            >
              {skillCategories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills Grid / Rows */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading profile skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 mx-auto flex items-center justify-center text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No skills match your filters</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add skills above using the standard taxonomy or typing a natural alias to start building your profile.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredSkills.map((item) => {
              const meta = PROFICIENCY_LABELS[item.proficiency] || PROFICIENCY_LABELS[0];
              const colors = PROFICIENCY_COLORS[item.proficiency] || PROFICIENCY_COLORS[0];
              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Skill Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: colors.bar }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {item.skill_name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category || 'General'}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold ${colors.text} block mt-0.5`}>
                        Level {item.proficiency} — {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Quick Inline Proficiency Switcher (0 to 4) */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                      {[0, 1, 2, 3, 4].map((lvl) => {
                        const isCurrent = item.proficiency === lvl;
                        const btnColor = PROFICIENCY_COLORS[lvl];
                        return (
                          <button
                            key={lvl}
                            onClick={() => changeProficiency(item.skill_id, lvl)}
                            title={`Set to Level ${lvl} (${PROFICIENCY_LABELS[lvl].label})`}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? `${btnColor.bg} ${btnColor.text} ring-1 ring-cyan-500`
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeSkill(item.skill_id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove skill from profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
