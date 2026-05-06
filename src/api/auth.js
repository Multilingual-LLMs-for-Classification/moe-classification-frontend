import client from './client';

export const authApi = {
  getProfile: () =>
    client.get('/api/v1/auth/profile').then((r) => r.data),

  updateProfile: (data) =>
    client.patch('/api/v1/auth/profile', data).then((r) => r.data),

  updateAvatar: (avatar) =>
    client.put('/api/v1/auth/profile/avatar', { avatar }).then((r) => r.data),

  deleteAvatar: () =>
    client.delete('/api/v1/auth/profile/avatar').then((r) => r.data),

  changePassword: (current_password, new_password) =>
    client.post('/api/v1/auth/profile/change-password', { current_password, new_password }),
};
