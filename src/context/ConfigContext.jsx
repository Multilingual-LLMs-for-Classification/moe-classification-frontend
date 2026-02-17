import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [registry, setRegistry] = useState(null);
  const [routerConfig, setRouterConfig] = useState(null);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [banner, setBanner] = useState(null);
  const [reloading, setReloading] = useState(false);

  const refreshRegistry = useCallback(() => {
    setLoading(true);
    adminApi.getExpertsRegistry()
      .then(res => { setRegistry(res.data); setError(''); })
      .catch(() => setError('Failed to load configuration'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refreshRegistry(); }, [refreshRegistry]);

  const loadRouterConfig = useCallback(() => {
    if (routerConfig) return;
    adminApi.getRouterConfig()
      .then(res => setRouterConfig(res.data))
      .catch(() => {});
  }, [routerConfig]);

  const loadTemplate = useCallback((taskKey) => {
    if (templates[taskKey]) return;
    adminApi.getTaskTemplate(taskKey)
      .then(res => setTemplates(prev => ({ ...prev, [taskKey]: res.data.templates })))
      .catch(() => {});
  }, [templates]);

  const showBanner = useCallback((msg, type = 'success') => {
    setBanner({ msg, type });
    if (type === 'success') setTimeout(() => setBanner(null), 5000);
  }, []);

  // Save handlers
  const handleSaveDefaultGeneration = async (data) => {
    try {
      const res = await adminApi.updateDefaultGeneration(data);
      setRegistry(prev => ({ ...prev, default_generation: res.data }));
      showBanner('Default generation updated. Reload system to apply.');
    } catch { showBanner('Failed to update default generation.', 'error'); }
  };

  const handleSaveTaskConfig = async (taskKey, data) => {
    try {
      const mapped = {};
      const keyMap = {
        'Base Model': 'base_model_key', 'Adapter': 'adapter_name',
        'Adapter Path': 'adapter_path', 'Expert Path': 'expert_path',
        'Strict Label Decoding': 'strict_label_decoding',
        'Constrained Single Token': 'constrained_single_token',
      };
      for (const [k, v] of Object.entries(data)) {
        const configKey = keyMap[k] || k;
        if (configKey === 'strict_label_decoding' || configKey === 'constrained_single_token') {
          mapped[configKey] = v === 'Yes' || v === true;
        } else {
          mapped[configKey] = v;
        }
      }
      const res = await adminApi.updateTaskConfig(taskKey, mapped);
      setRegistry(prev => ({
        ...prev,
        tasks: { ...prev.tasks, [taskKey]: res.data },
      }));
      showBanner(`Task "${taskKey}" updated. Reload system to apply.`);
    } catch { showBanner(`Failed to update task "${taskKey}".`, 'error'); }
  };

  const handleSaveGenOverrides = async (taskKey, data) => {
    try {
      const res = await adminApi.updateTaskConfig(taskKey, { generation: data });
      setRegistry(prev => ({
        ...prev,
        tasks: { ...prev.tasks, [taskKey]: res.data },
      }));
      showBanner(`Generation overrides for "${taskKey}" updated.`);
    } catch { showBanner('Failed to update generation overrides.', 'error'); }
  };

  const handleUpdateLangMapping = async (taskKey, lang, data) => {
    try {
      await adminApi.updateLanguageMapping(taskKey, lang, data);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" updated.`);
    } catch { showBanner(`Failed to update language mapping "${lang}".`, 'error'); }
  };

  const handleDeleteLangMapping = async (taskKey, lang) => {
    try {
      await adminApi.deleteLanguageMapping(taskKey, lang);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" deleted.`);
    } catch { showBanner(`Failed to delete language mapping "${lang}".`, 'error'); }
  };

  const handleAddLangMapping = async (taskKey, lang, data) => {
    try {
      await adminApi.updateLanguageMapping(taskKey, lang, data);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" added.`);
    } catch { showBanner(`Failed to add language mapping "${lang}".`, 'error'); }
  };

  const handleSaveTemplates = async (taskKey, templateData) => {
    try {
      const res = await adminApi.updateTaskTemplate(taskKey, templateData);
      setTemplates(prev => ({ ...prev, [taskKey]: res.data.templates }));
      showBanner(`Templates for "${taskKey}" updated.`);
    } catch { showBanner('Failed to update templates.', 'error'); }
  };

  const handleReload = async () => {
    setReloading(true);
    try {
      const res = await adminApi.reloadSystem();
      if (res.data.success) {
        showBanner('System reloaded successfully!');
      } else {
        showBanner(`Reload failed: ${res.data.message}`, 'error');
      }
    } catch { showBanner('Failed to reload system.', 'error'); }
    finally { setReloading(false); }
  };

  return (
    <ConfigContext.Provider value={{
      registry, routerConfig, templates, loading, error,
      editMode, setEditMode, banner, setBanner, reloading,
      refreshRegistry, loadRouterConfig, loadTemplate, showBanner,
      handleSaveDefaultGeneration, handleSaveTaskConfig, handleSaveGenOverrides,
      handleUpdateLangMapping, handleDeleteLangMapping, handleAddLangMapping,
      handleSaveTemplates, handleReload,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider');
  return ctx;
}
