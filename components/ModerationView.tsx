
import React, { useState } from 'react';
import { LogType } from '../types';

interface ModerationViewProps {
  onLog: (type: LogType, action: string, target: string, reason?: string) => void;
}

const ModerationView: React.FC<ModerationViewProps> = ({ onLog }) => {
  const [targetUser, setTargetUser] = useState('');
  const [reason, setReason] = useState('');

  // Clear options state
  const [messageLimit, setMessageLimit] = useState<number | string>(10);
  const [timeValue, setTimeValue] = useState<number | string>(30);
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours'>('minutes');

  // Absolute range state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAction = (type: LogType, actionLabel: string) => {
    if (!targetUser) {
      alert("Bestie, are you delusional? You need to pick a target user first. 🙄");
      return;
    }

    onLog(type, actionLabel, targetUser, reason);
    alert(`${actionLabel} successful. They're literally gone, period. 💅`);
    setTargetUser('');
    setReason('');
  };

  const clearMessages = (mode: 'all' | 'limit' | 'time' | 'range', customValue?: { val: number, unit: 'minutes' | 'hours' }) => {
    let actionLabel = 'Purged';
    let target = '';
    let r = '';
    let alertMsg = '';

    const activeVal = customValue ? customValue.val : Number(timeValue);
    const activeUnit = customValue ? customValue.unit : timeUnit;

    switch (mode) {
      case 'all':
        actionLabel = 'Nuked';
        target = '#general (ALL)';
        r = 'Full channel annihilation. Starting fresh.';
        alertMsg = "Nuked the whole chat. It was giving major 2012 energy anyway. ✨";
        break;
      case 'limit':
        const limit = Number(messageLimit);
        if (isNaN(limit) || limit <= 0) {
          alert("A zero or negative count? My IQ is dropping just looking at this. Pick a real number. 🙄");
          return;
        }
        actionLabel = 'Purged';
        target = `#general (${limit} msgs)`;
        r = `Bulk delete of ${limit} messages.`;
        alertMsg = `Deleted ${limit} messages. My eyes feel better already. 🗑️`;
        break;
      case 'time':
        if (isNaN(activeVal) || activeVal <= 0) {
          alert("Time is money, and you're wasting both with that invalid input. 💅");
          return;
        }
        actionLabel = 'Time Purge';
        target = `#general (Last ${activeVal} ${activeUnit})`;
        r = `Deleted messages from the last ${activeVal} ${activeUnit}.`;
        alertMsg = `Wiped the last ${activeVal} ${activeUnit} of history. Like it never happened. 🧘‍♀️`;
        break;
      case 'range':
        if (!startTime || !endTime) {
          alert("I need a start AND an end time. I'm a bot, not a psychic. 🙄");
          return;
        }
        actionLabel = 'Range Purge';
        target = `#general (${startTime} to ${endTime})`;
        r = `Deleted messages between ${startTime} and ${endTime}.`;
        alertMsg = `That specific era of chat has been erased. History is rewritten. 🥂`;
        break;
    }

    onLog('clear', actionLabel, target, r);
    alert(alertMsg);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* User Discipline Column */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 space-y-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">User Discipline</h3>
          <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Judgment Mode</span>
        </div>

        <div className="space-y-6">
          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest group-focus-within:text-pink-500 transition-colors">Victim Username / ID</label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="e.g. BrokeBoy#1234"
              className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all text-slate-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">What's the tea? (Reason)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are they being so mid?"
              className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all h-32 text-slate-700 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleAction('mute', 'Muted')}
              className="bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Mute 🙊
            </button>
            <button
              onClick={() => handleAction('soft-ban', 'Soft Ban')}
              className="bg-amber-50 text-amber-700 py-4 rounded-2xl font-bold hover:bg-amber-100 transition-all active:scale-95"
            >
              Soft Ban 👢
            </button>
            <button
              onClick={() => handleAction('ban', 'Banned')}
              className="col-span-2 bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
            >
              Permanent Exile 🔨
            </button>
          </div>
        </div>
      </div>

      {/* Sanitation & History Column */}
      <div className="space-y-8">
        {/* Relative Sanitation */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Sanitize History</h3>
            <p className="text-sm text-slate-400 italic">"Relative time or bulk cleaning. Efficiency is key."</p>
          </div>

          <div className="space-y-8">
            {/* Quick Purge Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quick Relative Purge</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => clearMessages('time', { val: 15, unit: 'minutes' })}
                  className="py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-100 transition-all"
                >
                  Last 15m
                </button>
                <button
                  onClick={() => clearMessages('time', { val: 1, unit: 'hours' })}
                  className="py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-100 transition-all"
                >
                  Last 1h
                </button>
                <button
                  onClick={() => clearMessages('time', { val: 24, unit: 'hours' })}
                  className="py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-100 transition-all"
                >
                  Last 24h
                </button>
              </div>
            </div>

            {/* Manual Time Select */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Custom Relative Time</label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-800 font-bold text-center"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as 'minutes' | 'hours')}
                  className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none text-slate-600 font-bold text-xs uppercase"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
                <button
                  onClick={() => clearMessages('time')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                >
                  Wipe ⏳
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* By Amount */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clear by Amount</label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={messageLimit}
                  onChange={(e) => setMessageLimit(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-800 font-bold"
                  placeholder="Count (e.g. 50)"
                />
                <button
                  onClick={() => clearMessages('limit')}
                  className="px-8 py-3 bg-white border border-slate-900 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  Purge 🧹
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Absolute Range Purge */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Absolute Time Range</h3>
            <p className="text-xs text-slate-400">Specify exactly when the drama started and ended. 🎭</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none text-slate-800 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none text-slate-800 font-bold"
              />
            </div>
          </div>

          <button
            onClick={() => clearMessages('range')}
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            Erase Specific Era 🕰️
          </button>
        </div>

        {/* Nuke Button */}
        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex flex-col items-center text-center shadow-sm">
          <button
            onClick={() => clearMessages('all')}
            className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
          >
            Nuke All Messages 🧨
          </button>
          <p className="text-[10px] text-red-400 mt-3 font-bold uppercase tracking-widest">Warning: This is literally irreversible.</p>
        </div>
      </div>
    </div>
  );
};

export default ModerationView;
