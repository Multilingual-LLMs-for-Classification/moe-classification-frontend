import client from './client';

export const projectsApi = {
  // ── Project CRUD ──
  list: () => client.get('/api/v1/projects').then((r) => r.data),
  create: (data) => client.post('/api/v1/projects', data).then((r) => r.data),
  get: (id) => client.get(`/api/v1/projects/${id}`).then((r) => r.data),
  delete: (id) => client.delete(`/api/v1/projects/${id}`),

  // ── Per-project analytics ──
  getSummary: (id) => client.get(`/api/v1/projects/${id}/analytics/summary`).then((r) => r.data),
  getTimeseries: (id, bucket = 'hour', days = 7) =>
    client.get(`/api/v1/projects/${id}/analytics/timeseries`, { params: { bucket, days } }).then((r) => r.data),
  getPerTask: (id) => client.get(`/api/v1/projects/${id}/analytics/per-task`).then((r) => r.data),
  getPerLanguage: (id) => client.get(`/api/v1/projects/${id}/analytics/per-language`).then((r) => r.data),
  getPerUser: (id) => client.get(`/api/v1/projects/${id}/analytics/per-user`).then((r) => r.data),
  getHistory: (id, params = {}) =>
    client.get(`/api/v1/projects/${id}/analytics/history`, { params }).then((r) => r.data),

  // ── Per-project config (full registry) ──
  getConfig: (id) => client.get(`/api/v1/projects/${id}/config`).then((r) => r.data),
  replaceConfig: (id, config_data) =>
    client.put(`/api/v1/projects/${id}/config`, { config_data }).then((r) => r.data),

  // ── Per-project config (fine-grained, all DB-backed) ──
  getConfigOverview: (id) =>
    client.get(`/api/v1/projects/${id}/config/overview`).then((r) => r.data),

  updateDefaultGeneration: (id, data) =>
    client.patch(`/api/v1/projects/${id}/config/default-generation`, data).then((r) => r.data),

  // Task list (one row per task from ProjectTaskConfig)
  listTaskConfigs: (id) =>
    client.get(`/api/v1/projects/${id}/config/tasks`).then((r) => r.data),
  getTaskConfig: (id, taskKey) =>
    client.get(`/api/v1/projects/${id}/config/tasks/${encodeURIComponent(taskKey)}`).then((r) => r.data),
  updateTaskConfig: (id, taskKey, data) =>
    client.patch(`/api/v1/projects/${id}/config/tasks/${encodeURIComponent(taskKey)}`, data).then((r) => r.data),

  updateLanguageMapping: (id, taskKey, lang, data) =>
    client.put(`/api/v1/projects/${id}/config/tasks/${encodeURIComponent(taskKey)}/languages/${lang}`, data).then((r) => r.data),
  deleteLanguageMapping: (id, taskKey, lang) =>
    client.delete(`/api/v1/projects/${id}/config/tasks/${encodeURIComponent(taskKey)}/languages/${lang}`),

  // ── Reset to defaults ──
  resetToDefaults: (id) =>
    client.post(`/api/v1/projects/${id}/config/reset-defaults`).then((r) => r.data),
  resetTaskToDefault: (id, taskKey) =>
    client.post(`/api/v1/projects/${id}/config/tasks/${encodeURIComponent(taskKey)}/reset-default`).then((r) => r.data),

  // ── System default config ──
  getSystemDefaults: () =>
    client.get('/api/v1/projects/system/defaults').then((r) => r.data),
  syncSystemDefaultsFromFilesystem: () =>
    client.post('/api/v1/projects/system/defaults/sync-filesystem').then((r) => r.data),
  saveAsSystemDefault: (configData) =>
    client.put('/api/v1/projects/system/defaults', { config_data: configData }).then((r) => r.data),
};
