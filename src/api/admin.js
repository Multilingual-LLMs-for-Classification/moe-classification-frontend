import client from './client';

export const adminApi = {
  // Read
  getConfigOverview: () => client.get('/api/v1/admin/config/overview'),
  getExpertsRegistry: () => client.get('/api/v1/admin/config/experts-registry'),
  getTaskConfig: (taskKey) => client.get(`/api/v1/admin/config/tasks/${taskKey}`),
  getTaskTemplate: (taskKey) => client.get(`/api/v1/admin/config/templates/${taskKey}`),
  getRouterConfig: () => client.get('/api/v1/admin/config/router'),

  // Write
  updateTaskConfig: (taskKey, data) => client.patch(`/api/v1/admin/config/tasks/${taskKey}`, data),
  updateLanguageMapping: (taskKey, lang, data) => client.put(`/api/v1/admin/config/tasks/${taskKey}/languages/${lang}`, data),
  deleteLanguageMapping: (taskKey, lang) => client.delete(`/api/v1/admin/config/tasks/${taskKey}/languages/${lang}`),
  updateDefaultGeneration: (data) => client.patch('/api/v1/admin/config/default-generation', data),
  updateTaskTemplate: (taskKey, templates) => client.put(`/api/v1/admin/config/templates/${taskKey}`, { templates }),
  reloadSystem: () => client.post('/api/v1/admin/config/reload'),
};
