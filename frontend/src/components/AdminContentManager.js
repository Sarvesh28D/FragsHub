'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign, Trophy, Calendar, Users, Settings, Download, Upload } from 'lucide-react';
import { adminConfig, updateAdminConfig } from '../lib/adminConfig';

export default function AdminContentManager({ onSave }) {
  const [activeTab, setActiveTab] = useState('tournament');
  const [config, setConfig] = useState(adminConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      // Save to Firebase/backend
      await updateAdminConfig(section, config[section]);
      onSave?.();
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const tabs = [
    { id: 'tournament', name: 'Tournament', icon: Trophy },
    { id: 'prizes', name: 'Prize Pool', icon: DollarSign },
    { id: 'content', name: 'Site Content', icon: Settings },
    { id: 'games', name: 'Games', icon: Users },
    { id: 'export', name: 'Data Export', icon: Download }
  ];

  return (
    <div className="backdrop-blur-xl bg-gray-900/90 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <motion.button
          onClick={() => handleSave(activeTab)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tournament Settings */}
      {activeTab === 'tournament' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Tournament Name</label>
              <input
                type="text"
                value={config.tournament.tournamentName}
                onChange={(e) => handleConfigChange('tournament', 'tournamentName', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Prize Pool ({config.tournament.currency})</label>
              <input
                type="number"
                value={config.tournament.prizePool}
                onChange={(e) => handleConfigChange('tournament', 'prizePool', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Registration Fee ({config.tournament.currency})</label>
              <input
                type="number"
                value={config.tournament.registrationFee}
                onChange={(e) => handleConfigChange('tournament', 'registrationFee', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Max Teams</label>
              <input
                type="number"
                value={config.tournament.maxTeams}
                onChange={(e) => handleConfigChange('tournament', 'maxTeams', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={config.tournament.startDate}
                onChange={(e) => handleConfigChange('tournament', 'startDate', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={config.tournament.endDate}
                onChange={(e) => handleConfigChange('tournament', 'endDate', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={config.tournament.description}
              onChange={(e) => handleConfigChange('tournament', 'description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      )}

      {/* Prize Distribution */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Total Prize Pool</label>
              <div className="text-3xl font-bold text-purple-400">
                {config.tournament.currency} {config.tournament.prizePool.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Prize Distribution</h3>
            {config.prizeDistribution.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <label className="block text-gray-300 mb-2">Position</label>
                  <input
                    type="number"
                    value={prize.position}
                    onChange={(e) => handleArrayChange('prizeDistribution', index, 'position', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Percentage (%)</label>
                  <input
                    type="number"
                    value={prize.percentage}
                    onChange={(e) => {
                      const percentage = parseInt(e.target.value);
                      const amount = (config.tournament.prizePool * percentage) / 100;
                      handleArrayChange('prizeDistribution', index, 'percentage', percentage);
                      handleArrayChange('prizeDistribution', index, 'amount', amount);
                    }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Amount ({config.tournament.currency})</label>
                  <input
                    type="number"
                    value={prize.amount}
                    onChange={(e) => handleArrayChange('prizeDistribution', index, 'amount', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Site Content */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Hero Title</label>
              <input
                type="text"
                value={config.content.heroTitle}
                onChange={(e) => handleConfigChange('content', 'heroTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Hero Subtitle</label>
              <input
                type="text"
                value={config.content.heroSubtitle}
                onChange={(e) => handleConfigChange('content', 'heroSubtitle', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                value={config.content.contactEmail}
                onChange={(e) => handleConfigChange('content', 'contactEmail', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">About Description</label>
            <textarea
              value={config.content.aboutDescription}
              onChange={(e) => handleConfigChange('content', 'aboutDescription', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      )}

      {/* Games Configuration */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {config.games.map((game, index) => (
            <div key={game.id} className="p-4 bg-white/5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={game.active}
                    onChange={(e) => handleArrayChange('games', index, 'active', e.target.checked)}
                    className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Team Size</label>
                  <input
                    type="number"
                    value={game.teamSize}
                    onChange={(e) => handleArrayChange('games', index, 'teamSize', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Map Pool (comma separated)</label>
                <input
                  type="text"
                  value={game.mapPool.join(', ')}
                  onChange={(e) => handleArrayChange('games', index, 'mapPool', e.target.value.split(', '))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Export */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Export Tournament Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                className="flex items-center justify-center gap-2 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Export to Google Sheets
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-5 h-5" />
                Import Team Data
              </motion.button>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <h4 className="text-yellow-300 font-semibold mb-2">Export Includes:</h4>
            <ul className="text-yellow-200 space-y-1">
              <li>• Team registrations and player details</li>
              <li>• Payment status and transaction IDs</li>
              <li>• Tournament brackets and match results</li>
              <li>• Prize distribution and payouts</li>
              <li>• Performance statistics</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
