import client from './client';

export const getSystemStats = () =>
  client.get('/api/v1/health/system').then((r) => r.data);
