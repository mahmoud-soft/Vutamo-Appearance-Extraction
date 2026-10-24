document.addEventListener('DOMContentLoaded', () => {
  // Ensure background video plays smoothly
  const video = document.getElementById('bg-video');
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }

  // -------------------------------------------------------------
  // Vutamo Appearance Settings (Background Video, Clock format, Blur, Shortcuts)
  // -------------------------------------------------------------
  const STORAGE_KEY_VUTAMO_SETTINGS = 'vutamo_appearance_settings';
  const vutamoSettings = {
    clockFormat: '12h',      // '12h' | '24h'
    showSeconds: false,      // true | false
    bgBlurEnabled: false,    // true | false
    bgBlurAmount: 8,         // 2 to 24 (px)
    showShortcuts: true      // true | false (entire section below search)
  };

  try {
    const savedVutamoSettings = localStorage.getItem(STORAGE_KEY_VUTAMO_SETTINGS);
    if (savedVutamoSettings) {
      Object.assign(vutamoSettings, JSON.parse(savedVutamoSettings));
    }
  } catch (e) {
    console.error('Failed to load vutamo settings:', e);
  }

  function saveVutamoSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_VUTAMO_SETTINGS, JSON.stringify(vutamoSettings));
    } catch (e) {
      console.error('Failed to save vutamo settings:', e);
    }
  }

  function applyBgVideo() {
    const video = document.getElementById('bg-video');
    if (!video) return;
    const targetSrc = 'assets/videos/Background_1.mp4';
    if (video.getAttribute('src') !== targetSrc) {
      video.src = targetSrc;
    }
    video.muted = true;
    video.play().catch(() => {});
  }

  function applyBgBlur() {
    const blur = vutamoSettings.bgBlurEnabled ? `${vutamoSettings.bgBlurAmount}px` : '0px';
    document.documentElement.style.setProperty('--bg-blur', blur);
  }

  function applyShortcutsVisibility() {
    const sec = document.getElementById('shortcuts-section');
    if (sec) {
      sec.classList.toggle('hidden', vutamoSettings.showShortcuts === false);
    }
  }

  applyBgVideo(false);
  applyBgBlur();
  applyShortcutsVisibility();

  // -------------------------------------------------------------
  // Clock (12-Hour or 24-Hour) & Gregorian Date
  // -------------------------------------------------------------
  const clockDigits = document.getElementById('clock-digits');
  const clockSeconds = document.getElementById('clock-seconds');
  const clockPeriod = document.getElementById('clock-period');
  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');

  function updateClock() {
    const now = new Date();

    if (clockDigits && clockPeriod) {
      const seconds = String(now.getSeconds()).padStart(2, '0');

      if (vutamoSettings.showSeconds) {
        if (clockTime) clockTime.classList.add('has-seconds');
        if (clockSeconds) {
          clockSeconds.textContent = `:${seconds}`;
          clockSeconds.style.display = 'inline-block';
        }
      } else {
        if (clockTime) clockTime.classList.remove('has-seconds');
        if (clockSeconds) {
          clockSeconds.style.display = 'none';
        }
      }

      if (vutamoSettings.clockFormat === '24h') {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockDigits.textContent = `${hours}:${minutes}`;
        clockPeriod.style.display = 'none';
      } else {
        let hours = now.getHours();
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12

        const minutes = String(now.getMinutes()).padStart(2, '0');

        clockDigits.textContent = `${hours}:${minutes}`;
        clockPeriod.textContent = period;
        clockPeriod.style.display = '';
      }
    }

    if (clockDate) {
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      clockDate.textContent = `${weekday}, ${day}/${month}/${year}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Google Apps Menu
  const appsBtn = document.getElementById('btn-google-apps');
  const appsMenu = document.getElementById('google-apps-menu');
  const appsScrollable = document.querySelector('.apps-scrollable');
  const editFavoritesBtn = document.getElementById('btn-edit-favorites');
  const favoritesGrid = document.getElementById('favorites-grid');
  const allAppsGrid = document.getElementById('all-apps-grid');

  if (appsScrollable) {
    appsScrollable.addEventListener('scroll', () => {
      appsScrollable.classList.toggle('scrolled-top', appsScrollable.scrollTop > 4);
    });
  }

  // Google Account Card
  const accountBtn = document.getElementById('btn-google-account');
  const accountCard = document.getElementById('google-account-card');
  const closeAccountBtn = document.getElementById('btn-close-account');

  // -------------------------------------------------------------
  // Restore custom apps order from localStorage
  // -------------------------------------------------------------
  const STORAGE_KEY_FAVORITES = 'vutamo_favorites_order';
  const STORAGE_KEY_ALL_APPS = 'vutamo_all_apps_order';

  function restoreAppsOrder() {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES) || 'null');
      const savedAllApps = JSON.parse(localStorage.getItem(STORAGE_KEY_ALL_APPS) || 'null');

      const appMap = new Map();
      document.querySelectorAll('.app-item').forEach(item => {
        if (item.dataset.appId) {
          appMap.set(item.dataset.appId, item);
        }
      });

      if (Array.isArray(savedFavorites) && favoritesGrid) {
        savedFavorites.forEach(id => {
          const el = appMap.get(id);
          if (el) {
            favoritesGrid.appendChild(el);
            appMap.delete(id);
          }
        });
      }

      if (Array.isArray(savedAllApps) && allAppsGrid) {
        savedAllApps.forEach(id => {
          const el = appMap.get(id);
          if (el) {
            allAppsGrid.appendChild(el);
            appMap.delete(id);
          }
        });
      }

      // Append any new or remaining apps that weren't in saved order (e.g. Fonts)
      if (allAppsGrid) {
        appMap.forEach(el => {
          allAppsGrid.appendChild(el);
        });
      }
    } catch (e) {
      console.error('Failed to restore apps order:', e);
    }
  }

  function saveAppsOrder() {
    if (!favoritesGrid || !allAppsGrid) return;
    const favIds = Array.from(favoritesGrid.querySelectorAll('.app-item'))
      .map(el => el.dataset.appId)
      .filter(Boolean);
    const otherIds = Array.from(allAppsGrid.querySelectorAll('.app-item'))
      .map(el => el.dataset.appId)
      .filter(Boolean);

    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favIds));
      localStorage.setItem(STORAGE_KEY_ALL_APPS, JSON.stringify(otherIds));
    } catch (e) {
      console.error('Failed to save apps order:', e);
    }
  }

  restoreAppsOrder();

  // -------------------------------------------------------------
  // Edit Mode & Drag-and-drop
  // -------------------------------------------------------------
  let isEditMode = false;
  let draggedItem = null;

  function setEditMode(active) {
    isEditMode = active;
    if (appsMenu) appsMenu.classList.toggle('edit-mode', isEditMode);
    if (editFavoritesBtn) {
      editFavoritesBtn.classList.toggle('active', isEditMode);
      if (isEditMode) {
        editFavoritesBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        editFavoritesBtn.title = 'Done';
        editFavoritesBtn.setAttribute('aria-label', 'Done editing');
      } else {
        editFavoritesBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editFavoritesBtn.title = 'Edit favorites';
        editFavoritesBtn.setAttribute('aria-label', 'Edit favorites');
        saveAppsOrder();
      }
    }

    document.querySelectorAll('.app-item').forEach(item => {
      item.setAttribute('draggable', isEditMode ? 'true' : 'false');
    });
  }

  if (editFavoritesBtn) {
    editFavoritesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setEditMode(!isEditMode);
    });
  }

  function initDragAndDrop() {
    const allAppItems = document.querySelectorAll('.app-item');
    const grids = [favoritesGrid, allAppsGrid].filter(Boolean);

    allAppItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        if (!isEditMode) {
          e.preventDefault();
          return;
        }
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.appId || '');
        setTimeout(() => {
          if (draggedItem === item) {
            item.classList.add('dragging');
          }
        }, 0);
      });

      item.addEventListener('dragend', () => {
        if (draggedItem) {
          draggedItem.classList.remove('dragging');
          draggedItem = null;
        }
        grids.forEach(g => g.classList.remove('drag-target'));
        saveAppsOrder();
      });

      // Prevent navigating to the URL when in edit mode
      item.addEventListener('click', (e) => {
        if (isEditMode) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    grids.forEach(grid => {
      grid.addEventListener('dragover', (e) => {
        if (!isEditMode || !draggedItem) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        grid.classList.add('drag-target');

        const targetItem = e.target.closest('.app-item');
        if (targetItem && targetItem !== draggedItem && targetItem.parentNode === grid) {
          const rect = targetItem.getBoundingClientRect();
          const isAfter = (e.clientY > rect.top + rect.height / 2) || (e.clientX > rect.left + rect.width / 2);
          if (isAfter) {
            targetItem.after(draggedItem);
          } else {
            targetItem.before(draggedItem);
          }
        } else if (!targetItem && (e.target === grid || e.target.closest('.apps-grid') === grid)) {
          grid.appendChild(draggedItem);
        }
      });

      grid.addEventListener('dragleave', (e) => {
        if (!grid.contains(e.relatedTarget)) {
          grid.classList.remove('drag-target');
        }
      });

      grid.addEventListener('drop', (e) => {
        if (!isEditMode || !draggedItem) return;
        e.preventDefault();
        grid.classList.remove('drag-target');
        saveAppsOrder();
      });
    });
  }

  initDragAndDrop();

  // -------------------------------------------------------------
  // Google Apps Menu toggle & Account Card toggle
  // -------------------------------------------------------------
  if (appsBtn && appsMenu) {
    appsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (accountCard) accountCard.classList.remove('open');
      if (accountBtn) accountBtn.classList.remove('active');
      const isOpen = appsMenu.classList.toggle('open');
      appsBtn.classList.toggle('active', isOpen);
      if (!isOpen && isEditMode) {
        setEditMode(false);
      }
    });
  }

  if (accountBtn && accountCard) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (appsMenu) {
        appsMenu.classList.remove('open');
        if (isEditMode) setEditMode(false);
      }
      if (appsBtn) appsBtn.classList.remove('active');
      const isOpen = accountCard.classList.toggle('open');
      accountBtn.classList.toggle('active', isOpen);
    });
  }

  if (closeAccountBtn && accountCard) {
    closeAccountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accountCard.classList.remove('open');
      if (accountBtn) accountBtn.classList.remove('active');
      if (accountEditBox) accountEditBox.classList.add('hidden');
    });
  }

  // =========================================================================
  // User Profile: Custom Avatar Upload & Editable Email / Name (v1.1.0)
  // =========================================================================
  const STORAGE_KEY_AVATAR = 'vutamo_user_avatar';
  const STORAGE_KEY_NAME = 'vutamo_user_name';
  const STORAGE_KEY_EMAIL = 'vutamo_user_email';

  const avatarWrapper = document.getElementById('account-avatar-wrapper');
  const inputAvatarFile = document.getElementById('input-avatar-file');
  const googleAvatarCircle = document.getElementById('google-avatar-circle');
  const cardAvatarCircle = document.getElementById('account-card-avatar-circle');
  const accountNameEl = document.getElementById('account-name');
  const accountEmailEl = document.getElementById('account-email');
  const btnEditProfile = document.getElementById('btn-edit-profile');
  const accountEditBox = document.getElementById('account-edit-box');
  const inputProfileName = document.getElementById('input-profile-name');
  const inputProfileEmail = document.getElementById('input-profile-email');
  const btnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');

  function renderUserAvatar(dataUrl, userName) {
    const initial = (userName || 'Mahmoud').trim().charAt(0).toUpperCase() || 'U';
    if (dataUrl) {
      if (googleAvatarCircle) {
        googleAvatarCircle.textContent = '';
        googleAvatarCircle.style.backgroundImage = `url("${dataUrl}")`;
      }
      if (cardAvatarCircle) {
        cardAvatarCircle.textContent = '';
        cardAvatarCircle.style.backgroundImage = `url("${dataUrl}")`;
      }
    } else {
      if (googleAvatarCircle) {
        googleAvatarCircle.style.backgroundImage = 'none';
        googleAvatarCircle.textContent = initial;
      }
      if (cardAvatarCircle) {
        cardAvatarCircle.style.backgroundImage = 'none';
        cardAvatarCircle.textContent = initial;
      }
    }
  }

  function loadUserProfile() {
    const savedName = localStorage.getItem(STORAGE_KEY_NAME) || 'Mahmoud';
    const savedEmail = localStorage.getItem(STORAGE_KEY_EMAIL) || 'mahmoudssoft@gmail.com';
    const savedAvatar = localStorage.getItem(STORAGE_KEY_AVATAR) || '';

    if (accountNameEl) accountNameEl.textContent = savedName;
    if (accountEmailEl) accountEmailEl.textContent = savedEmail;
    renderUserAvatar(savedAvatar, savedName);
  }

  loadUserProfile();

  // Avatar Click -> Trigger File Input
  if (avatarWrapper && inputAvatarFile) {
    avatarWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      inputAvatarFile.click();
    });

    inputAvatarFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target.result;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width;
          let h = img.height;

          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);

          try {
            localStorage.setItem(STORAGE_KEY_AVATAR, compressed);
            const currentName = localStorage.getItem(STORAGE_KEY_NAME) || 'Mahmoud';
            renderUserAvatar(compressed, currentName);
          } catch (err) {
            console.warn('Could not save avatar:', err);
          }
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
      inputAvatarFile.value = '';
    });
  }

  // Toggle Profile Edit Form
  if (btnEditProfile && accountEditBox) {
    btnEditProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = accountEditBox.classList.contains('hidden');
      if (isHidden) {
        if (inputProfileName) inputProfileName.value = (accountNameEl ? accountNameEl.textContent : '').trim();
        if (inputProfileEmail) inputProfileEmail.value = (accountEmailEl ? accountEmailEl.textContent : '').trim();
        accountEditBox.classList.remove('hidden');
        if (inputProfileName) inputProfileName.focus();
      } else {
        accountEditBox.classList.add('hidden');
      }
    });
  }

  if (btnCancelEditProfile && accountEditBox) {
    btnCancelEditProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      accountEditBox.classList.add('hidden');
    });
  }

  if (accountEditBox) {
    accountEditBox.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = (inputProfileName ? inputProfileName.value : '').trim() || 'Mahmoud';
      const newEmail = (inputProfileEmail ? inputProfileEmail.value : '').trim() || 'mahmoudssoft@gmail.com';

      localStorage.setItem(STORAGE_KEY_NAME, newName);
      localStorage.setItem(STORAGE_KEY_EMAIL, newEmail);

      if (accountNameEl) accountNameEl.textContent = newName;
      if (accountEmailEl) accountEmailEl.textContent = newEmail;

      const currentAvatar = localStorage.getItem(STORAGE_KEY_AVATAR) || '';
      renderUserAvatar(currentAvatar, newName);

      accountEditBox.classList.add('hidden');
    });
  }

  // Click outside to close open menus
  document.addEventListener('click', (e) => {
    if (appsMenu && !appsMenu.contains(e.target) && e.target !== appsBtn && !appsBtn.contains(e.target)) {
      appsMenu.classList.remove('open');
      if (appsBtn) appsBtn.classList.remove('active');
      if (isEditMode) setEditMode(false);
    }
    if (accountCard && !accountCard.contains(e.target) && e.target !== accountBtn && !accountBtn.contains(e.target)) {
      accountCard.classList.remove('open');
      if (accountBtn) accountBtn.classList.remove('active');
    }
    const sDrawer = document.getElementById('settings-drawer');
    const sBtn = document.getElementById('btn-settings');
    if (sDrawer && !sDrawer.contains(e.target) && e.target !== sBtn && !sBtn?.contains(e.target)) {
      if (typeof closeSettingsDrawer === 'function') closeSettingsDrawer();
    }
  });

  // ESC key closes any open dropdown or modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (appsMenu) {
        appsMenu.classList.remove('open');
        if (isEditMode) setEditMode(false);
      }
      if (appsBtn) appsBtn.classList.remove('active');
      if (accountCard) accountCard.classList.remove('open');
      if (accountBtn) accountBtn.classList.remove('active');
      const modal = document.getElementById('shortcut-modal-overlay');
      if (modal) modal.classList.remove('open');
      if (typeof closeSettingsDrawer === 'function') closeSettingsDrawer();
    }
  });

  // -------------------------------------------------------------
  // Search Bar Interactions (Submit, Voice, Lens, Suggestions)
  // -------------------------------------------------------------
  const searchForm = document.getElementById('search-form');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');
  const lensBtn = document.getElementById('btn-lens-search');
  const suggestionsBox = document.getElementById('search-suggestions');

  if (searchBar && searchInput) {
    searchBar.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.search-suggestions')) return;
      searchInput.focus();
    });
  }

  // Handle Form Submit (Search or Direct URL)
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      clearSuggestions();

      // Check if user entered a direct URL
      const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(query);
      if (isUrl && !query.includes(' ')) {
        const dest = query.startsWith('http://') || query.startsWith('https://') ? query : `https://${query}`;
        window.location.href = dest;
        return;
      }

      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    });
  }

  // -------------------------------------------------------------
  // Google Live Search Suggestions (Autocomplete)
  // -------------------------------------------------------------
  let activeSuggestionIndex = -1;
  let currentSuggestions = [];
  let debounceTimer = null;

  async function fetchSuggestions(query) {
    if (!query) {
      clearSuggestions();
      return;
    }

    try {
      const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        renderSuggestions(data[1].slice(0, 8), query);
      } else {
        clearSuggestions();
      }
    } catch (err) {
      console.warn('Suggestions fetch warning:', err);
    }
  }

  function renderSuggestions(suggestions, query) {
    currentSuggestions = suggestions;
    activeSuggestionIndex = -1;

    if (!suggestions.length || !suggestionsBox) {
      clearSuggestions();
      return;
    }

    suggestionsBox.innerHTML = '';
    suggestions.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.setAttribute('data-index', index);
      if (/[\u0600-\u06FF]/.test(item)) {
        div.classList.add('is-arabic');
      }

      const icon = document.createElement('span');
      icon.className = 'suggestion-icon';
      icon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z"/>
      </svg>`;

      const text = document.createElement('span');
      text.className = 'suggestion-text';
      text.textContent = item;

      div.appendChild(icon);
      div.appendChild(text);

      div.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = item;
        searchForm.dispatchEvent(new Event('submit'));
      });

      suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.add('show');
  }

  function clearSuggestions() {
    currentSuggestions = [];
    activeSuggestionIndex = -1;
    if (suggestionsBox) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.remove('show');
    }
  }

  function updateSelectedSuggestion() {
    if (!suggestionsBox) return;
    const items = suggestionsBox.querySelectorAll('.suggestion-item');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === activeSuggestionIndex);
    });

    if (activeSuggestionIndex >= 0 && activeSuggestionIndex < currentSuggestions.length) {
      searchInput.value = currentSuggestions[activeSuggestionIndex];
      if (/[\u0600-\u06FF]/.test(searchInput.value)) {
        searchInput.classList.add('is-arabic');
        searchInput.setAttribute('dir', 'rtl');
      } else {
        searchInput.classList.remove('is-arabic');
        searchInput.setAttribute('dir', 'ltr');
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const raw = searchInput.value;
      if (/[\u0600-\u06FF]/.test(raw)) {
        searchInput.classList.add('is-arabic');
        searchInput.setAttribute('dir', 'rtl');
      } else {
        searchInput.classList.remove('is-arabic');
        searchInput.setAttribute('dir', 'ltr');
      }

      const q = raw.trim();
      if (!q) {
        clearSuggestions();
        return;
      }
      debounceTimer = setTimeout(() => {
        fetchSuggestions(q);
      }, 160);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (!suggestionsBox || !suggestionsBox.classList.contains('show')) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % currentSuggestions.length;
        updateSelectedSuggestion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
        updateSelectedSuggestion();
      } else if (e.key === 'Escape') {
        clearSuggestions();
      }
    });
  }

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (searchForm && !searchForm.contains(e.target)) {
      clearSuggestions();
    }
  });

  // -------------------------------------------------------------
  // Google Lens (Camera)
  // -------------------------------------------------------------
  if (lensBtn) {
    lensBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'https://lens.google.com';
    });
  }

  // -------------------------------------------------------------
  // Shortcuts & Add Website Modal
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Shortcuts Grid & Modal Management (Matching User Design)
  // -------------------------------------------------------------
  const STORAGE_KEY_SHORTCUTS = 'vutamo_user_shortcuts_v2';
  const defaultShortcuts = [
    { title: 'YouTube', url: 'https://www.youtube.com' },
    { title: 'Google', url: 'https://www.google.com' },
    { title: 'Pinterest', url: 'https://www.pinterest.com' },
    { title: 'Steam', url: 'https://store.steampowered.com' }
  ];

  let userShortcuts = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHORTCUTS);
    if (saved) {
      userShortcuts = JSON.parse(saved);
    } else {
      userShortcuts = defaultShortcuts;
      localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(defaultShortcuts));
    }
  } catch (e) {
    userShortcuts = defaultShortcuts;
  }

  let editingShortcutIndex = null;
  const shortcutsGrid = document.getElementById('shortcuts-grid');
  const shortcutModalOverlay = document.getElementById('shortcut-modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const shortcutNameInput = document.getElementById('shortcut-name-input');
  const shortcutUrlInput = document.getElementById('shortcut-url-input');
  const btnCancelShortcut = document.getElementById('btn-cancel-shortcut');
  const btnSaveShortcut = document.getElementById('btn-save-shortcut');

  function saveShortcuts() {
    try {
      localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(userShortcuts));
    } catch (e) {
      console.error('Failed to save shortcuts:', e);
    }
  }

  function getShortcutLogo(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('youtube.com')) {
        return 'assets/logos/youtube.png';
      }
      if (host === 'google.com' || host === 'www.google.com') {
        return 'assets/logos/search.png';
      }
      return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`;
    } catch (_) {
      return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`;
    }
  }

  function renderShortcuts() {
    if (!shortcutsGrid) return;
    shortcutsGrid.innerHTML = '';

    userShortcuts.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'shortcut-card';
      card.title = item.title;

      // 3-dots Menu Button
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'shortcut-more-btn';
      moreBtn.title = 'Options';
      moreBtn.setAttribute('aria-label', 'Options');
      moreBtn.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

      // Dropdown menu (Edit & Delete)
      const dropdown = document.createElement('div');
      dropdown.className = 'shortcut-dropdown';
      dropdown.innerHTML = `
        <button type="button" class="shortcut-dropdown-btn shortcut-edit-btn">
          <i class="fa-regular fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
        <button type="button" class="shortcut-dropdown-btn shortcut-delete-btn">
          <i class="fa-regular fa-trash-can"></i>
          <span>Delete</span>
        </button>
      `;

      const editActionBtn = dropdown.querySelector('.shortcut-edit-btn');
      editActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.remove('open');
        openShortcutModal(index);
      });

      const deleteActionBtn = dropdown.querySelector('.shortcut-delete-btn');
      deleteActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        userShortcuts.splice(index, 1);
        saveShortcuts();
        renderShortcuts();
      });

      moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close any other open dropdowns
        document.querySelectorAll('.shortcut-dropdown.open').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });

      // Link (Card Content)
      const link = document.createElement('a');
      link.className = 'shortcut-card-link';
      link.href = item.url;
      link.target = '_self';

      // Logo
      const img = document.createElement('img');
      img.className = 'shortcut-logo-img';
      img.src = getShortcutLogo(item.url);
      img.alt = item.title;
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'shortcut-card-fallback';
        fallback.textContent = (item.title || 'S').charAt(0).toUpperCase();
        link.insertBefore(fallback, link.firstChild);
      };

      // Title
      const title = document.createElement('span');
      title.className = 'shortcut-card-title';
      title.textContent = item.title;

      link.appendChild(img);
      link.appendChild(title);

      card.appendChild(moreBtn);
      card.appendChild(dropdown);
      card.appendChild(link);

      card.addEventListener('click', (e) => {
        if (!e.target.closest('.shortcut-more-btn') && !e.target.closest('.shortcut-dropdown')) {
          window.location.href = item.url;
        }
      });

      shortcutsGrid.appendChild(card);
    });

    // Add website card (Exact square, no blur) - conditional based on settings
    if (vutamoSettings.showAddShortcut !== false) {
      const addCard = document.createElement('div');
      addCard.className = 'add-shortcut-card';
      addCard.title = 'Add shortcut';
      addCard.setAttribute('role', 'button');
      addCard.setAttribute('tabindex', '0');
      addCard.innerHTML = `<span class="plus-icon"><i class="fa-solid fa-plus"></i></span>`;

      addCard.addEventListener('click', (e) => {
        e.stopPropagation();
        openShortcutModal(null);
      });

      addCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openShortcutModal(null);
        }
      });

      shortcutsGrid.appendChild(addCard);
    }
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.shortcut-card')) {
      document.querySelectorAll('.shortcut-dropdown.open').forEach(d => {
        d.classList.remove('open');
      });
    }
  });
  function checkArabicModalInput(inputEl) {
    if (!inputEl) return;
    if (/[\u0600-\u06FF]/.test(inputEl.value)) {
      inputEl.classList.add('is-arabic');
      inputEl.setAttribute('dir', 'rtl');
    } else {
      inputEl.classList.remove('is-arabic');
      inputEl.setAttribute('dir', 'ltr');
    }
  }

  function openShortcutModal(index = null) {
    if (!shortcutModalOverlay) return;
    editingShortcutIndex = index;
    if (index !== null && userShortcuts[index]) {
      if (modalTitle) modalTitle.textContent = 'Edit shortcut';
      if (shortcutNameInput) {
        shortcutNameInput.value = userShortcuts[index].title;
        checkArabicModalInput(shortcutNameInput);
      }
      if (shortcutUrlInput) shortcutUrlInput.value = userShortcuts[index].url;
    } else {
      if (modalTitle) modalTitle.textContent = 'Add shortcut';
      if (shortcutNameInput) {
        shortcutNameInput.value = '';
        checkArabicModalInput(shortcutNameInput);
      }
      if (shortcutUrlInput) shortcutUrlInput.value = '';
    }

    shortcutModalOverlay.classList.add('open');
    setTimeout(() => {
      if (shortcutNameInput) shortcutNameInput.focus();
    }, 50);
  }

  function closeShortcutModal() {
    editingShortcutIndex = null;
    if (shortcutModalOverlay) {
      shortcutModalOverlay.classList.remove('open');
    }
  }

  function handleSaveShortcut() {
    const name = shortcutNameInput ? shortcutNameInput.value.trim() : '';
    let url = shortcutUrlInput ? shortcutUrlInput.value.trim() : '';

    if (!url) {
      if (shortcutUrlInput) shortcutUrlInput.focus();
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let title = name;
    if (!title) {
      try {
        title = new URL(url).hostname.replace('www.', '');
      } catch (_) {
        title = url;
      }
    }

    if (editingShortcutIndex !== null && editingShortcutIndex >= 0 && editingShortcutIndex < userShortcuts.length) {
      userShortcuts[editingShortcutIndex] = { title, url };
    } else {
      userShortcuts.push({ title, url });
    }

    saveShortcuts();
    renderShortcuts();
    closeShortcutModal();
  }

  if (btnCancelShortcut) {
    btnCancelShortcut.addEventListener('click', (e) => {
      e.stopPropagation();
      closeShortcutModal();
    });
  }

  if (btnSaveShortcut) {
    btnSaveShortcut.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSaveShortcut();
    });
  }

  if (shortcutModalOverlay) {
    shortcutModalOverlay.addEventListener('click', (e) => {
      if (e.target === shortcutModalOverlay) {
        closeShortcutModal();
      }
    });
  }

  if (shortcutNameInput) {
    shortcutNameInput.addEventListener('input', () => {
      checkArabicModalInput(shortcutNameInput);
    });
  }

  [shortcutNameInput, shortcutUrlInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveShortcut();
        } else if (e.key === 'Escape') {
          closeShortcutModal();
        }
      });
    }
  });

  renderShortcuts();

  // -------------------------------------------------------------
  // Weather Display with City Detection & Caching (Icon Based)
  // -------------------------------------------------------------
  const weatherIconEl = document.getElementById('weather-icon');
  const weatherTempEl = document.getElementById('weather-temp');
  const weatherCityEl = document.getElementById('weather-city');
  const STORAGE_KEY_WEATHER = 'vutamo_weather_data';

  const SUN_SVG = `<svg class="weather-sun-svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#FFC107" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5" fill="#FFC107"></circle><line x1="12" y1="1.5" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22.5"></line><line x1="4.5" y1="4.5" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.5" y2="19.5"></line><line x1="1.5" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22.5" y2="12"></line><line x1="4.5" y1="19.5" x2="6.3" y2="17.7"></line><line x1="17.7" y1="6.3" x2="19.5" y2="4.5"></line></svg>`;

  const MOON_SVG = `<svg class="weather-moon-svg" viewBox="0 0 24 24" width="17" height="17" fill="#E2E8F0" stroke="#E2E8F0" stroke-width="1.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function getWeatherIconHtml(code, isDay) {
    if (code === 0 || code === 1) {
      return isDay ? SUN_SVG : MOON_SVG;
    }
    if (code >= 2 && code <= 3) {
      return isDay 
        ? '<i class="fa-solid fa-cloud-sun weather-icon-partly"></i>' 
        : '<i class="fa-solid fa-cloud weather-icon-cloud"></i>';
    }
    if (code === 45 || code === 48) {
      return '<i class="fa-solid fa-smog weather-icon-fog"></i>';
    }
    if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) {
      return '<i class="fa-solid fa-cloud-rain weather-icon-rain"></i>';
    }
    if (code >= 61 && code <= 67) {
      return '<i class="fa-solid fa-cloud-showers-heavy weather-icon-rain"></i>';
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return '<i class="fa-regular fa-snowflake weather-icon-snow"></i>';
    }
    if (code >= 95) {
      return '<i class="fa-solid fa-cloud-bolt weather-icon-storm"></i>';
    }
    return isDay ? SUN_SVG : MOON_SVG;
  }

  function renderWeatherUI(weather) {
    if (!weather) return;
    if (weatherTempEl) weatherTempEl.textContent = `${Math.round(weather.temp)}°C`;
    if (weatherCityEl) weatherCityEl.textContent = weather.city || '';
    if (weatherIconEl) weatherIconEl.innerHTML = getWeatherIconHtml(weather.code, weather.isDay);
  }

  async function fetchWeather() {
    try {
      // 1. Get city & coordinates via IP
      const geoRes = await fetch('https://ipwho.is/');
      if (!geoRes.ok) return;
      const geoData = await geoRes.json();
      if (!geoData.success) return;

      const city = geoData.city || geoData.region || 'Muscat';
      const lat = geoData.latitude;
      const lon = geoData.longitude;

      // 2. Get live weather from Open-Meteo
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!weatherRes.ok) return;
      const weatherData = await weatherRes.json();
      if (!weatherData.current_weather) return;

      const current = weatherData.current_weather;
      const weatherObj = {
        city: city,
        temp: current.temperature,
        code: current.weathercode,
        isDay: current.is_day === 1,
        timestamp: Date.now()
      };

      localStorage.setItem(STORAGE_KEY_WEATHER, JSON.stringify(weatherObj));
      renderWeatherUI(weatherObj);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    }
  }

  function initWeather() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_WEATHER);
      if (cached) {
        const parsed = JSON.parse(cached);
        renderWeatherUI(parsed);
        // Refresh if older than 30 mins
        if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
          fetchWeather();
        }
      } else {
        fetchWeather();
      }
    } catch (_) {
      fetchWeather();
    }
  }

  initWeather();

  // -------------------------------------------------------------
  // Bottom-Left Keyboard Typewriter Greeting (Caveat Font)
  // -------------------------------------------------------------
  const greetingTextEl = document.getElementById('greeting-text');
  const typewriterCursorEl = document.querySelector('.typewriter-cursor');

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  }

  let currentGreetingStr = '';
  let isTypingGreeting = false;

  function typeWriterGreeting(targetText, speed = 85) {
    if (!greetingTextEl) return;
    isTypingGreeting = true;
    greetingTextEl.textContent = '';
    if (typewriterCursorEl) typewriterCursorEl.classList.remove('hidden');
    let i = 0;

    function typeChar() {
      if (i < targetText.length) {
        greetingTextEl.textContent += targetText.charAt(i);
        i++;
        // Natural keyboard typing jitter
        const delay = speed + (Math.random() * 40 - 20);
        setTimeout(typeChar, delay);
      } else {
        currentGreetingStr = targetText;
        isTypingGreeting = false;
        // Fade out and remove cursor line after finishing
        setTimeout(() => {
          if (typewriterCursorEl) typewriterCursorEl.classList.add('hidden');
        }, 800);
      }
    }

    setTimeout(typeChar, 300);
  }

  function initGreeting() {
    const targetGreeting = getTimeGreeting();
    typeWriterGreeting(targetGreeting);

    setInterval(() => {
      const newGreeting = getTimeGreeting();
      if (newGreeting !== currentGreetingStr && !isTypingGreeting) {
        typeWriterGreeting(newGreeting);
      }
    }, 60000);
  }

  initGreeting();

  // -------------------------------------------------------------
  // Settings Drawer Controller & Event Listeners
  // -------------------------------------------------------------
  const btnSettings = document.getElementById('btn-settings');
  const settingsDrawer = document.getElementById('settings-drawer');
  const settingsDrawerOverlay = document.getElementById('settings-drawer-overlay');
  const btnCloseSettings = document.getElementById('btn-close-settings');

  const clockFormatBtns = document.querySelectorAll('#clock-format-control .segment-btn');
  const toggleClockSeconds = document.getElementById('toggle-clock-seconds');
  const toggleBgBlur = document.getElementById('toggle-bg-blur');
  const blurSliderGroup = document.getElementById('blur-slider-group');
  const inputBlurAmount = document.getElementById('input-blur-amount');
  const blurValBadge = document.getElementById('blur-val-badge');
  const toggleShortcutsSection = document.getElementById('toggle-shortcuts-section');

  function openSettingsDrawer() {
    if (settingsDrawer) settingsDrawer.classList.add('open');
    if (settingsDrawerOverlay) settingsDrawerOverlay.classList.add('open');
    if (btnSettings) btnSettings.classList.add('active');

    // Close any other open panels (Google Apps, Account)
    if (appsMenu) appsMenu.classList.remove('open');
    if (appsBtn) appsBtn.classList.remove('active');
    if (accountCard) accountCard.classList.remove('open');
    if (accountBtn) accountBtn.classList.remove('active');
  }

  function closeSettingsDrawer() {
    if (settingsDrawer) settingsDrawer.classList.remove('open');
    if (settingsDrawerOverlay) settingsDrawerOverlay.classList.remove('open');
    if (btnSettings) btnSettings.classList.remove('active');
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      if (settingsDrawer && settingsDrawer.classList.contains('open')) {
        closeSettingsDrawer();
      } else {
        openSettingsDrawer();
      }
    });
  }

  if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSettingsDrawer();
    });
  }

  if (settingsDrawerOverlay) {
    settingsDrawerOverlay.addEventListener('click', () => {
      closeSettingsDrawer();
    });
  }

  if (settingsDrawer) {
    settingsDrawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Update Settings UI elements to match current state
  function syncSettingsUI() {
    // 1. Clock format segmented buttons
    clockFormatBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === vutamoSettings.clockFormat);
    });

    // Clock seconds toggle
    if (toggleClockSeconds) {
      toggleClockSeconds.checked = !!vutamoSettings.showSeconds;
    }

    // 2. Blur toggle & slider
    if (toggleBgBlur) {
      toggleBgBlur.checked = !!vutamoSettings.bgBlurEnabled;
    }
    if (blurSliderGroup) {
      blurSliderGroup.classList.toggle('hidden', !vutamoSettings.bgBlurEnabled);
    }
    if (inputBlurAmount) {
      inputBlurAmount.value = vutamoSettings.bgBlurAmount || 8;
    }
    if (blurValBadge) {
      blurValBadge.textContent = `${vutamoSettings.bgBlurAmount || 8}px`;
    }

    // 3. Shortcuts section toggle (All websites under search)
    if (toggleShortcutsSection) {
      toggleShortcutsSection.checked = vutamoSettings.showShortcuts !== false;
    }
  }



  // Clock format change (12h vs 24h)
  clockFormatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      if (format && vutamoSettings.clockFormat !== format) {
        vutamoSettings.clockFormat = format;
        saveVutamoSettings();
        syncSettingsUI();
        updateClock();
      }
    });
  });

  // Clock seconds toggle
  if (toggleClockSeconds) {
    toggleClockSeconds.addEventListener('change', () => {
      vutamoSettings.showSeconds = toggleClockSeconds.checked;
      saveVutamoSettings();
      updateClock();
    });
  }

  // Background blur toggle
  if (toggleBgBlur) {
    toggleBgBlur.addEventListener('change', () => {
      vutamoSettings.bgBlurEnabled = toggleBgBlur.checked;
      saveVutamoSettings();
      applyBgBlur();
      if (blurSliderGroup) {
        blurSliderGroup.classList.toggle('hidden', !vutamoSettings.bgBlurEnabled);
      }
    });
  }

  // Background blur amount slider
  if (inputBlurAmount) {
    inputBlurAmount.addEventListener('input', () => {
      const val = parseInt(inputBlurAmount.value, 10) || 8;
      vutamoSettings.bgBlurAmount = val;
      if (blurValBadge) blurValBadge.textContent = `${val}px`;
      if (vutamoSettings.bgBlurEnabled) {
        applyBgBlur();
      }
    });

    inputBlurAmount.addEventListener('change', () => {
      saveVutamoSettings();
    });
  }

  // Shortcuts section toggle (Show / hide all websites under search)
  if (toggleShortcutsSection) {
    toggleShortcutsSection.addEventListener('change', () => {
      vutamoSettings.showShortcuts = toggleShortcutsSection.checked;
      saveVutamoSettings();
      applyShortcutsVisibility();
    });
  }

  syncSettingsUI();
});



