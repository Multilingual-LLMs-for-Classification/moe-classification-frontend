import client from './client';

export const getSummary = () =>
  client.get('/api/v1/analytics/summary').then((r) => r.data);

export const getTimeseries = (bucket = 'hour', days = 7) =>
  client.get('/api/v1/analytics/timeseries', { params: { bucket, days } }).then((r) => r.data);

export const getPerTask = () =>
  client.get('/api/v1/analytics/per-task').then((r) => r.data);

export const getPerLanguage = () =>
  client.get('/api/v1/analytics/per-language').then((r) => r.data);

export const getPerUser = () =>
  client.get('/api/v1/analytics/per-user').then((r) => r.data);

export const getHistory = (params = {}) =>
  client.get('/api/v1/analytics/history', { params }).then((r) => r.data);

export const getPerProject = () =>
  client.get('/api/v1/analytics/per-project').then((r) => r.data);
