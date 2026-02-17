import { useState } from 'react';

export default function CollapsibleSection({ title, badge, defaultOpen = false, onExpand, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onExpand) onExpand();
  };

  return (
    <div className="config-section">
      <button className="config-section-header" onClick={handleToggle}>
        <span className="config-chevron">{open ? '\u25BC' : '\u25B6'}</span>
        <span className="config-section-title">{title}</span>
        {badge !== undefined && <span className="config-badge">{badge}</span>}
      </button>
      {open && <div className="config-section-body">{children}</div>}
    </div>
  );
}
