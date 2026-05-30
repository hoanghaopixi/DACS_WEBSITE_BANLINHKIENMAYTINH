import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';

const SettingsContext = createContext(null);

const FONTS = [
  { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: 'Segoe UI (Mặc định)' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Quicksand', sans-serif", label: 'Quicksand' },
  { value: "'Be Vietnam Pro', sans-serif", label: 'Be Vietnam Pro' },
];

const DEFAULT_SETTINGS = {
  theme: 'light',
  fontFamily: FONTS[0].value,
  fontSize: 14,
  primaryColor: '#6366f1',
  sidebarDark: true,
  animationsEnabled: true,
  compactMode: false,
  siteName: 'Hoàng Hảo PC',
  siteDescription: 'Chuyên linh kiện máy tính chính hãng',
  siteDetail: 'Chúng tôi tập trung vào linh kiện chính hãng, tư vấn cấu hình đúng nhu cầu và hậu mãi rõ ràng.',
  contactPhone: '0123 456 789',
  contactEmail: 'support@hoanghaopc.vn',
  address: 'TP. Hồ Chí Minh, Việt Nam',
  socialFacebook: '#',
  socialYoutube: '#',
  socialZalo: '#',
  socialInstagram: '#',
  currency: 'VND',
  language: 'vi',
  itemsPerPage: 20,
  enableRegistration: true,
  enableLogin: true,
};

export { FONTS, DEFAULT_SETTINGS };

/**
 * Load saved settings from localStorage, merging with defaults.
 */
function loadSavedSettings() {
  try {
    const saved = localStorage.getItem('adminSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function SettingsProvider({ children }) {
  // `settings` = the SAVED (committed) settings
  const [settings, setSettings] = useState(loadSavedSettings);

  // `draftSettings` = the PENDING (unsaved) settings being edited on the Settings page
  // null means no draft is active (not on settings page or no changes made)
  const [draftSettings, setDraftSettings] = useState(null);

  // The "active" settings that should be applied to the DOM
  // If draft is active, use draft; otherwise use saved
  const activeSettings = draftSettings || settings;

  // Track whether there are unsaved changes
  const isDirty = draftSettings !== null && JSON.stringify(draftSettings) !== JSON.stringify(settings);

  // Ref to saved settings for revert
  const savedRef = useRef(settings);
  savedRef.current = settings;

  // --- Load Google Font khi fontFamily thay đổi ---
  useEffect(() => {
    const fontName = activeSettings.fontFamily.match(/'([^']+)'/)?.[1];
    if (fontName && fontName !== 'Segoe UI') {
      const id = 'gfont-' + fontName.replace(/\s/g, '-');
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, '+')}:wght@400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [activeSettings.fontFamily]);

  // --- Áp dụng theme, font, fontSize, primaryColor lên toàn bộ trang ---
  useEffect(() => {
    const root = document.documentElement;

    // Font
    root.style.setProperty('--app-font', activeSettings.fontFamily);
    document.body.style.fontFamily = activeSettings.fontFamily;

    // Font size
    root.style.setProperty('--app-font-size', activeSettings.fontSize + 'px');
    document.body.style.fontSize = activeSettings.fontSize + 'px';

    // Primary color → tính ra các biến thể
    root.style.setProperty('--primary', activeSettings.primaryColor);
    root.style.setProperty('--primary-hover', adjustBrightness(activeSettings.primaryColor, -15));
    root.style.setProperty('--primary-light', adjustBrightness(activeSettings.primaryColor, 40));

    // Theme sáng / tối
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = activeSettings.theme === 'dark' || (activeSettings.theme === 'auto' && prefersDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Inject dynamic dark mode CSS to override inline styles in admin pages
    const styleId = 'dark-mode-inline-override';
    let styleEl = document.getElementById(styleId);
    if (isDark) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        /* ============================================
           DYNAMIC DARK MODE — Admin Pages
           ============================================ */

        /* ---- 1. TEXT: Only override elements WITHOUT inline color ---- */
        .admin-page div:not([style*="color"]),
        .admin-page p:not([style*="color"]),
        .admin-page td:not([style*="color"]),
        .admin-page li:not([style*="color"]),
        .admin-page small:not([style*="color"]),
        .admin-page span:not([style*="color"]) {
          color: #e2e8f0 !important;
        }

        .admin-page h1, .admin-page h2, .admin-page h3, .admin-page h4, .admin-page h5,
        .admin-page strong, .admin-page b {
          color: #ffffff !important;
        }

        .admin-page th { color: #94a3b8 !important; }
        .admin-page label, .admin-page legend { color: #cbd5e1 !important; }
        .admin-page input::placeholder,
        .admin-page textarea::placeholder { color: #94a3b8 !important; }

        /* ---- 2. DARK INLINE TEXT → LIGHT ---- */
        .admin-page [style*="color: rgb(15, 23, 42)"],
        .admin-page [style*="color: rgb(30, 41, 59)"],
        .admin-page [style*="color: rgb(51, 65, 85)"],
        .admin-page [style*="color: rgb(71, 85, 105)"] {
          color: #ffffff !important;
        }
        .admin-page [style*="color: rgb(100, 116, 139)"],
        .admin-page [style*="color: rgb(148, 163, 184)"] {
          color: #94a3b8 !important;
        }

        /* ---- 3. BADGES: light bg + dark text → dark bg + light text ---- */
        .admin-page [style*="background: rgb(220, 252, 231)"],
        .admin-page [style*="background-color: rgb(220, 252, 231)"] {
          background-color: #052e16 !important; color: #4ade80 !important;
        }
        .admin-page [style*="background: rgb(254, 243, 199)"],
        .admin-page [style*="background-color: rgb(254, 243, 199)"] {
          background-color: #422006 !important; color: #fbbf24 !important;
        }
        .admin-page [style*="background: rgb(254, 226, 226)"],
        .admin-page [style*="background-color: rgb(254, 226, 226)"] {
          background-color: #450a0a !important; color: #fca5a5 !important;
        }
        .admin-page [style*="background: rgb(219, 234, 254)"],
        .admin-page [style*="background-color: rgb(219, 234, 254)"] {
          background-color: #172554 !important; color: #93c5fd !important;
        }
        .admin-page [style*="background: rgb(224, 231, 255)"],
        .admin-page [style*="background-color: rgb(224, 231, 255)"] {
          background-color: #312e81 !important; color: #c7d2fe !important;
        }
        .admin-page [style*="background: rgb(240, 253, 244)"] {
          background-color: #052e16 !important; border-color: #166534 !important;
        }
        .admin-page [style*="background: rgb(255, 251, 235)"] {
          background-color: #422006 !important; border-color: #854d0e !important;
        }
        .admin-page [style*="background: rgb(254, 242, 242)"],
        .admin-page [style*="background: rgb(254, 252, 232)"] {
          background-color: #450a0a !important; border-color: #991b1b !important;
        }

        /* ---- 4. SEMANTIC COLORS → brighter for dark bg ---- */
        .admin-page [style*="color: rgb(22, 163, 74)"],
        .admin-page [style*="color: rgb(22, 101, 52)"],
        .admin-page [style*="color: rgb(21, 128, 61)"] { color: #4ade80 !important; }
        .admin-page [style*="color: rgb(220, 38, 38)"],
        .admin-page [style*="color: rgb(239, 68, 68)"] { color: #f87171 !important; }
        .admin-page [style*="color: rgb(217, 119, 6)"],
        .admin-page [style*="color: rgb(146, 64, 14)"],
        .admin-page [style*="color: rgb(120, 53, 15)"],
        .admin-page [style*="color: rgb(245, 158, 11)"] { color: #fbbf24 !important; }
        .admin-page [style*="color: rgb(37, 99, 235)"] { color: #60a5fa !important; }
        .admin-page [style*="color: rgb(99, 102, 241)"],
        .admin-page [style*="color: rgb(67, 56, 202)"] { color: #a5b4fc !important; }
        .admin-page [style*="color: rgb(34, 197, 94)"] { color: #4ade80 !important; }

        /* ---- 5. WHITE/GRAY BACKGROUNDS → DARK ---- */
        .admin-page .admin-card { background: #1e293b !important; }

        .admin-page [style*="background: rgb(255, 255, 255)"],
        .admin-page [style*="background-color: rgb(255, 255, 255)"] {
          background-color: #1e293b !important;
        }
        .admin-page [style*="background: rgb(248, 250, 252)"],
        .admin-page [style*="background: rgb(241, 245, 249)"],
        .admin-page [style*="background-color: rgb(248, 250, 252)"],
        .admin-page [style*="background-color: rgb(241, 245, 249)"] {
          background-color: #334155 !important;
        }

        /* ---- 6. MODALS ---- */
        .admin-page > div[style*="fixed"],
        .admin-page > div[style*="inset"] {
          background: rgba(0, 0, 0, 0.6) !important;
        }
        .admin-page > div[style*="fixed"] > div,
        .admin-page > div[style*="inset"] > div {
          background-color: #1e293b !important;
        }
        .admin-page > div[style*="fixed"] > div > div[style*="border"],
        .admin-page > div[style*="inset"] > div > div[style*="border"],
        .admin-page > div[style*="fixed"] > div > div[style*="sticky"],
        .admin-page > div[style*="inset"] > div > div[style*="sticky"] {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        .admin-page > div[style*="fixed"] > div div[style*="background"],
        .admin-page > div[style*="inset"] > div div[style*="background"] {
          background-color: #334155 !important;
          border-color: #475569 !important;
        }

        /* ---- 7. BORDERS ---- */
        .admin-page div[style*="border"] { border-color: #334155 !important; }

        /* ---- 8. FORMS ---- */
        .admin-page input, .admin-page select, .admin-page textarea {
          background-color: var(--bg-input) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
        }
        .admin-page .search-input-container input {
          border: none !important;
          background-color: transparent !important;
        }
        .admin-page select option {
          background-color: var(--bg-input) !important;
          color: var(--text-primary) !important;
        }

        /* ---- 9. BUTTONS ---- */
        .admin-page button[style*="background: rgb(241, 245, 249)"] {
          background-color: #334155 !important; color: #e2e8f0 !important;
        }
        .btn-primary, .btn-primary span, .btn-primary div { color: white !important; }

        /* ---- 10. STATUS BADGES (class-based) ---- */
        .status-badge.completed { background: #052e16 !important; color: #4ade80 !important; }
        .status-badge.pending { background: #422006 !important; color: #fbbf24 !important; }
        .status-badge.shipping { background: #172554 !important; color: #60a5fa !important; }
        .status-badge.cancelled { background: #450a0a !important; color: #f87171 !important; }

        /* ---- 11. FILTER TAGS ---- */
        .admin-page .category-badge, .admin-page .badge {
          background: #334155 !important; color: #e2e8f0 !important;
        }
      `;
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }

    // Compact mode
    root.setAttribute('data-compact', activeSettings.compactMode ? 'true' : 'false');

    // Animations
    root.setAttribute('data-animations', activeSettings.animationsEnabled ? 'true' : 'false');
  }, [activeSettings]);

  // Lắng nghe thay đổi system theme khi chọn "auto"
  useEffect(() => {
    if (activeSettings.theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [activeSettings.theme]);

  /**
   * Update a single setting in the DRAFT state (does NOT persist).
   * If no draft exists yet, creates one from saved settings.
   */
  const updateDraftSetting = useCallback((key, value) => {
    setDraftSettings(prev => {
      const base = prev || { ...settings };
      return { ...base, [key]: value };
    });
  }, [settings]);

  /**
   * Start editing: initialize draft from saved settings.
   */
  const startEditing = useCallback(() => {
    setDraftSettings({ ...settings });
  }, [settings]);

  /**
   * Commit (save) draft settings → persist to localStorage and update saved state.
   */
  const commitSettings = useCallback(() => {
    if (draftSettings) {
      setSettings({ ...draftSettings });
      localStorage.setItem('adminSettings', JSON.stringify(draftSettings));
      setDraftSettings(null);
    }
  }, [draftSettings]);

  /**
   * Revert (discard) draft → go back to saved settings.
   */
  const revertSettings = useCallback(() => {
    setDraftSettings(null);
    // DOM will re-apply saved settings via the useEffect above
  }, []);

  /**
   * Legacy: update a single setting AND persist immediately.
   * Used by components outside of the Settings page.
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('adminSettings', JSON.stringify(next));
      return next;
    });
    // Also update draft if one is active
    setDraftSettings(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('adminSettings', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setDraftSettings(null);
    localStorage.removeItem('adminSettings');
  }, []);

  const value = useMemo(() => ({
    settings: activeSettings,       // Always returns the "active" settings (draft if editing, saved otherwise)
    savedSettings: settings,        // The persisted/saved settings
    isDirty,                        // Whether there are unsaved changes
    updateSetting,                  // Legacy: update + persist immediately
    updateSettings,                 // Legacy: update multiple + persist immediately
    updateDraftSetting,             // Update draft only (no persist)
    startEditing,                   // Initialize draft from saved
    commitSettings,                 // Persist draft → saved
    revertSettings,                 // Discard draft → back to saved
    resetSettings,                  // Reset all to DEFAULT_SETTINGS
    FONTS,
  }), [activeSettings, settings, isDirty, updateSetting, updateSettings, updateDraftSetting, startEditing, commitSettings, revertSettings, resetSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

// --- Helper: điều chỉnh độ sáng hex color ---
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xFF) + Math.round(255 * percent / 100));
  const g = clamp(((num >> 8) & 0xFF) + Math.round(255 * percent / 100));
  const b = clamp((num & 0xFF) + Math.round(255 * percent / 100));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
