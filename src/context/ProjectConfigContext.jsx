import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectsApi } from '../api/projects';

const ProjectConfigContext = createContext(null);

export function ProjectConfigProvider({ children }) {
  const { projectId } = useParams();
  const id = Number(projectId);

  const [registry, setRegistry] = useState(null);   // full assembled config from DB
  const [tasks, setTasks] = useState([]);            // flat list from ProjectTaskConfig rows
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [banner, setBanner] = useState(null);

  const showBanner = useCallback((msg, type = 'success') => {
    setBanner({ msg, type });
    if (type === 'success') setTimeout(() => setBanner(null), 5000);
  }, []);

  // Load full registry (default_generation + base_models + tasks dict) and task list in parallel
  const refreshRegistry = useCallback(() => {
    setLoading(true);
    Promise.all([
      projectsApi.getConfig(id),
      projectsApi.listTaskConfigs(id),
    ])
      .then(([configData, taskList]) => {
        setRegistry(configData.config_data);
        setTasks(taskList);
        setError('');
      })
      .catch(() => setError('Failed to load project configuration.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { refreshRegistry(); }, [refreshRegistry]);

  // ── Save handlers ──

  const handleSaveDefaultGeneration = async (data) => {
    const parsed = {};
    for (const [k, v] of Object.entries(data)) {
      parsed[k] = isNaN(v) ? v : Number(v);
    }
    try {
      const updated = await projectsApi.updateDefaultGeneration(id, parsed);
      setRegistry((prev) => ({ ...prev, default_generation: updated }));
      showBanner('Default generation saved to database.');
    } catch {
      showBanner('Failed to save default generation.', 'error');
    }
  };

  const handleSaveTaskConfig = async (taskKey, data) => {
    const keyMap = {
      'Base Model': 'base_model_key',
      'Adapter': 'adapter_name',
      'Adapter Path': 'adapter_path',
      'Expert Path': 'expert_path',
      'Template Path': 'template_path',
      'Strict Label Decoding': 'strict_label_decoding',
      'Constrained Single Token': 'constrained_single_token',
    };
    const mapped = {};
    for (const [k, v] of Object.entries(data)) {
      const configKey = keyMap[k] || k;
      if (configKey === 'strict_label_decoding' || configKey === 'constrained_single_token') {
        mapped[configKey] = v === 'Yes' || v === true;
      } else {
        mapped[configKey] = v;
      }
    }
    try {
      const updated = await projectsApi.updateTaskConfig(id, taskKey, mapped);
      // Update flat task list
      setTasks((prev) => prev.map((t) => t.task_key === taskKey ? updated : t));
      showBanner(`Task "${taskKey}" saved to database.`);
    } catch {
      showBanner(`Failed to save task "${taskKey}".`, 'error');
    }
  };

  const handleSaveGenOverrides = async (taskKey, data) => {
    const parsed = {};
    for (const [k, v] of Object.entries(data)) {
      parsed[k] = isNaN(v) ? v : Number(v);
    }
    try {
      const updated = await projectsApi.updateTaskConfig(id, taskKey, { generation: parsed });
      setTasks((prev) => prev.map((t) => t.task_key === taskKey ? updated : t));
      showBanner(`Generation overrides for "${taskKey}" saved.`);
    } catch {
      showBanner('Failed to save generation overrides.', 'error');
    }
  };

  const handleUpdateLangMapping = async (taskKey, lang, data) => {
    try {
      await projectsApi.updateLanguageMapping(id, taskKey, lang, data);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" saved to database.`);
    } catch {
      showBanner(`Failed to update language mapping "${lang}".`, 'error');
    }
  };

  const handleDeleteLangMapping = async (taskKey, lang) => {
    try {
      await projectsApi.deleteLanguageMapping(id, taskKey, lang);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" deleted.`);
    } catch {
      showBanner(`Failed to delete language mapping "${lang}".`, 'error');
    }
  };

  const handleAddLangMapping = async (taskKey, lang, data) => {
    try {
      await projectsApi.updateLanguageMapping(id, taskKey, lang, data);
      refreshRegistry();
      showBanner(`Language mapping "${lang}" added to database.`);
    } catch {
      showBanner(`Failed to add language mapping "${lang}".`, 'error');
    }
  };

  const handleSaveAsDefault = async () => {
    if (!registry) return;
    // Build full config including task rows
    const taskDict = {};
    tasks.forEach((t) => { taskDict[t.task_key] = t; });
    const fullConfig = { ...registry, tasks: taskDict };
    try {
      await projectsApi.saveAsSystemDefault(fullConfig);
      showBanner('Current config saved as system default.');
    } catch {
      showBanner('Failed to save as system default.', 'error');
    }
  };

  const handleResetAllToDefaults = async () => {
    try {
      // Always re-read from the filesystem JSON first, then reset the project
      await projectsApi.syncSystemDefaultsFromFilesystem();
      await projectsApi.resetToDefaults(id);
      refreshRegistry();
      showBanner('Reset to JSON source defaults and saved to database.');
    } catch {
      showBanner('Failed to reset to defaults.', 'error');
    }
  };

  const handleResetTaskToDefault = async (taskKey) => {
    try {
      const updated = await projectsApi.resetTaskToDefault(id, taskKey);
      setTasks((prev) => prev.map((t) => t.task_key === taskKey ? updated : t));
      showBanner(`Task "${taskKey}" reset to default.`);
    } catch {
      showBanner(`Failed to reset task "${taskKey}".`, 'error');
    }
  };

  return (
    <ProjectConfigContext.Provider value={{
      registry, tasks, loading, error, editMode, setEditMode, banner, setBanner,
      refreshRegistry, showBanner,
      handleSaveDefaultGeneration, handleSaveTaskConfig, handleSaveGenOverrides,
      handleUpdateLangMapping, handleDeleteLangMapping, handleAddLangMapping,
      handleResetAllToDefaults, handleResetTaskToDefault,
      handleSaveAsDefault,
    }}>
      {children}
    </ProjectConfigContext.Provider>
  );
}

export function useProjectConfig() {
  const ctx = useContext(ProjectConfigContext);
  if (!ctx) throw new Error('useProjectConfig must be used inside ProjectConfigProvider');
  return ctx;
}
