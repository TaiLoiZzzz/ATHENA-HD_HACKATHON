'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  LightBulbIcon,
  ChartBarIcon,
  SparklesIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { personalizationService, UserPreferences, Recommendation, Insight } from '@/services/personalizationService';

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preferences' | 'recommendations' | 'insights'>('preferences');

  useEffect(() => {
    if (isOpen) {
      loadPersonalizationData();
    }
  }, [isOpen]);

  const loadPersonalizationData = async () => {
    try {
      setLoading(true);
      const [prefs, recs, ins] = await Promise.all([
        personalizationService.getPersonalizationData(),
        personalizationService.getRecommendations(5),
        personalizationService.getInsights(3)
      ]);
      
      setPreferences(prefs.preferences);
      setRecommendations(recs);
      setInsights(ins);
    } catch (error) {
      console.error('Failed to load personalization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    try {
      const updated = await personalizationService.updatePreferences(newPrefs);
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      await personalizationService.dismissRecommendation(id);
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Personalization Center</h2>
                  <p className="text-white/80 text-sm">Customize your ATHENA experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4">
              {[
                { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
                { id: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
                { id: 'insights', label: 'Insights', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'preferences' && preferences && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select
                            value={preferences.language}
                            onChange={(e) => updatePreferences({ language: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select
                            value={preferences.currency}
                            onChange={(e) => updatePreferences({ currency: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="VND">VND</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                          <select
                            value={preferences.theme}
                            onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                          <select
                            value={preferences.dashboard.layout}
                            onChange={(e) => updatePreferences({ 
                              dashboard: { 
                                ...preferences.dashboard, 
                                layout: e.target.value as any 
                              } 
                            })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                            <option value="compact">Compact</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Notifications</h4>
                        <div className="space-y-3">
                          {Object.entries(preferences.notifications).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => updatePreferences({
                                  notifications: {
                                    ...preferences.notifications,
                                    [key]: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{key}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'recommendations' && (
                  <motion.div
                    key="recommendations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
                    
                    {recommendations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No recommendations available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recommendations.map((rec) => (
                          <div key={rec.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {rec.priority}
                                  </span>
                                  <span className="text-sm text-gray-500 capitalize">{rec.type}</span>
                                </div>
                                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                {rec.price && (
                                  <div className="mt-2 text-sm">
                                    <span className="font-medium text-green-600">${rec.price.toLocaleString()}</span>
                                    {rec.savings && (
                                      <span className="text-gray-500 ml-2">Save ${rec.savings}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => dismissRecommendation(rec.id)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <XMarkIcon className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Your Insights</h3>
                    
                    {insights.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No insights available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {insights.map((insight) => (
                          <div key={insight.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium text-gray-600 capitalize">{insight.type}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    insight.trend === 'up' ? 'bg-green-100 text-green-800' :
                                    insight.trend === 'down' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {insight.trend}
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                <div className="mt-2 flex items-center space-x-4">
                                  <span className="text-lg font-bold text-blue-600">
                                    {insight.value.toLocaleString()}
                                  </span>
                                  <span className={`text-sm ${
                                    insight.change > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {insight.change > 0 ? '+' : ''}{insight.change}%
                                  </span>
                                </div>
                                {insight.actionable && insight.actionText && (
                                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    {insight.actionText} →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonalizationPanel;

