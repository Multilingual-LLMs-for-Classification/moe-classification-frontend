import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

// Resize an image file to max dimensions using canvas, returns base64 data URL
function resizeImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { username, profile, updateProfile, updateAvatar, removeAvatar } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar ?? null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null);
  const fileInputRef = useRef(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const initials = (profile?.display_name || username || '?')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  // ── Avatar ──

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarMsg({ type: 'error', text: 'Please select an image file.' });
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 256);
      setAvatarPreview(dataUrl);
      setAvatarMsg(null);
    } catch {
      setAvatarMsg({ type: 'error', text: 'Failed to read image.' });
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview) return;
    setAvatarSaving(true);
    try {
      await updateAvatar(avatarPreview);
      setAvatarMsg({ type: 'success', text: 'Profile picture updated.' });
    } catch {
      setAvatarMsg({ type: 'error', text: 'Failed to save profile picture.' });
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarSaving(true);
    try {
      await removeAvatar();
      setAvatarPreview(null);
      setAvatarMsg({ type: 'success', text: 'Profile picture removed.' });
    } catch {
      setAvatarMsg({ type: 'error', text: 'Failed to remove picture.' });
    } finally {
      setAvatarSaving(false);
    }
  };

  // ── Profile fields ──

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ display_name: displayName || null, bio: bio || null });
      setProfileMsg({ type: 'success', text: 'Profile saved.' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to save profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password ──

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to change password.';
      setPwMsg({ type: 'error', text: detail });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="page profile-page">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-grid">

        {/* ── Avatar card ── */}
        <div className="profile-card profile-avatar-card">
          <h3>Profile Picture</h3>

          <div className="avatar-display">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="avatar-large" />
            ) : (
              <div className="avatar-large avatar-placeholder">
                {initials}
              </div>
            )}
          </div>

          {avatarMsg && (
            <div className={`profile-msg ${avatarMsg.type}`}>{avatarMsg.text}</div>
          )}

          <div className="avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarSaving}
            >
              Choose Photo
            </button>
            {avatarPreview !== profile?.avatar && avatarPreview && (
              <button
                className="btn-primary"
                onClick={handleSaveAvatar}
                disabled={avatarSaving}
              >
                {avatarSaving ? 'Saving…' : 'Save Photo'}
              </button>
            )}
            {profile?.avatar && (
              <button
                className="btn-secondary"
                onClick={handleRemoveAvatar}
                disabled={avatarSaving}
              >
                Remove
              </button>
            )}
          </div>
          <p className="profile-hint">Max 256×256 px. JPG or PNG recommended.</p>
        </div>

        {/* ── Profile fields card ── */}
        <div className="profile-card">
          <h3>Account Info</h3>

          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="profile-field">
              <label>Username</label>
              <input className="profile-input" value={username ?? ''} disabled />
              <span className="profile-field-hint">Username cannot be changed.</span>
            </div>

            <div className="profile-field">
              <label>Display Name</label>
              <input
                className="profile-input"
                value={displayName}
                placeholder="e.g. Jane Smith"
                maxLength={100}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label>Bio</label>
              <textarea
                className="profile-input profile-textarea"
                value={bio}
                placeholder="A short bio…"
                maxLength={500}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
              />
              <span className="profile-field-hint">{bio.length}/500</span>
            </div>

            {profileMsg && (
              <div className={`profile-msg ${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change password card ── */}
        <div className="profile-card profile-password-card">
          <h3>Change Password</h3>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="profile-field">
              <label>Current Password</label>
              <input
                type="password"
                className="profile-input"
                value={currentPw}
                autoComplete="current-password"
                onChange={(e) => setCurrentPw(e.target.value)}
                required
              />
            </div>
            <div className="profile-field">
              <label>New Password</label>
              <input
                type="password"
                className="profile-input"
                value={newPw}
                autoComplete="new-password"
                minLength={8}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </div>
            <div className="profile-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="profile-input"
                value={confirmPw}
                autoComplete="new-password"
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>

            {pwMsg && (
              <div className={`profile-msg ${pwMsg.type}`}>{pwMsg.text}</div>
            )}

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary" disabled={pwSaving}>
                {pwSaving ? 'Saving…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
