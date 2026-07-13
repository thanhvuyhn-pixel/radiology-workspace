const CONFIG = {
  appsSource: "apps.json",
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh",
  storageKeys: {
    theme: "radiology-workspace-theme",
    recentApps: "radiology-workspace-recent-apps",
    sidebar: "radiology-workspace-sidebar",
    favorites: "radiology-workspace-launcher-favorites"
  }
};

const menuItems = [
  { id: "home", label: "Home", icon: "home", active: true },
  { id: "operations", label: "Administration", icon: "users" },
  { id: "clinical", label: "Clinical", icon: "scan-heart" },
  { id: "research", label: "Research", icon: "microscope" },
  { id: "favorites", label: "Favorites", icon: "star" },
  { id: "settings", label: "Settings", icon: "settings" }
];

const colorClassMap = {
  blue: "is-blue",
  green: "is-green",
  orange: "is-orange",
  red: "is-red"
};

const statusMap = {
  online: { label: "Online", className: "status-online", dot: "🟢" },
  beta: { label: "Beta", className: "status-beta", dot: "🟡" },
  offline: { label: "Offline", className: "status-offline", dot: "🔴" }
};

const state = {
  apps: [],
  filteredApps: [],
  searchOpen: false,
  searchIndex: 0,
  currentView: "home",
  launcherQuery: ""
};

const elements = {
  shell: document.querySelector("#workspace-shell"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  navigation: document.querySelector("#navigation"),
  quickLaunch: document.querySelector("#quick-launch"),
  quickActions: document.querySelector("#quick-actions"),
  todayApps: document.querySelector("#today-apps"),
  recentActivity: document.querySelector("#recent-activity"),
  continueWidget: document.querySelector("#continue-widget"),
  continueLink: document.querySelector("#continue-link"),
  continueName: document.querySelector("#continue-name"),
  launcherSearch: document.querySelector("#launcher-search"),
  clearSearch: document.querySelector("#clear-search"),
  heroCard: document.querySelector(".hero-card"),
  quickActionsSection: document.querySelector(".quick-actions"),
  launcherSearchPanel: document.querySelector(".launcher-search-panel"),
  favoritesSection: document.querySelector(".favorites-section"),
  recentlyUsedSection: document.querySelector(".recently-used-section"),
  libraryToolbar: document.querySelector(".main-workspace > .toolbar"),
  libraryKicker: document.querySelector(".main-workspace > .toolbar .section-kicker"),
  libraryTitle: document.querySelector(".main-workspace > .toolbar h2"),
  favoriteGrid: document.querySelector("#favorite-grid"),
  favoriteCount: document.querySelector("#favorite-count"),
  recentGrid: document.querySelector("#recent-grid"),
  recentCount: document.querySelector("#recent-count"),
  appGrid: document.querySelector("#app-grid"),
  appCount: document.querySelector("#app-count"),
  currentDate: document.querySelector("#current-date"),
  currentTime: document.querySelector("#current-time"),
  heroGreeting: document.querySelector("#hero-greeting"),
  todayGreeting: document.querySelector("#today-greeting"),
  themeToggle: document.querySelector("#theme-toggle"),
  commandButton: document.querySelector("#command-button"),
  commandOverlay: document.querySelector("#command-overlay"),
  globalSearch: document.querySelector("#global-search"),
  searchResults: document.querySelector("#search-results")
};

function createIcon(name, className = "") {
  return `<i class="${className}" data-lucide="${name || "app-window"}" aria-hidden="true"></i>`;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.8
      }
    });
  }
}

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getFavoriteIds() {
  return readStorage(CONFIG.storageKeys.favorites, null);
}

function isFavorite(app) {
  const favoriteIds = getFavoriteIds();
  return favoriteIds ? favoriteIds.includes(app.id) : Boolean(app.favorite);
}

function persistFavorite(appId, nextValue) {
  const baseIds = state.apps.filter((app) => app.favorite).map((app) => app.id);
  const favoriteIds = getFavoriteIds() || baseIds;
  const nextIds = nextValue
    ? [...new Set([...favoriteIds, appId])]
    : favoriteIds.filter((id) => id !== appId);

  writeStorage(CONFIG.storageKeys.favorites, nextIds);
}

function getAppById(appId) {
  return state.apps.find((app) => app.id === appId);
}

function getRecentApps() {
  const recentIds = readStorage(CONFIG.storageKeys.recentApps, []);
  return recentIds.map(getAppById).filter(Boolean);
}

function getStatus(app) {
  return statusMap[app.status] || statusMap.offline;
}

function getLaunchHref(app) {
  return app.launchMode === "workspace" && app.workspacePath ? app.workspacePath : app.url;
}

function getSearchText(app) {
  return [app.name, app.category, app.description, app.owner, app.status]
    .join(" ")
    .toLowerCase();
}

function getFilteredApps() {
  const query = state.launcherQuery.trim().toLowerCase();

  if (!query) {
    return state.apps;
  }

  return state.apps.filter((app) => getSearchText(app).includes(query));
}

function filterApps(apps) {
  const query = state.launcherQuery.trim().toLowerCase();

  if (!query) {
    return apps;
  }

  return apps.filter((app) => getSearchText(app).includes(query));
}

function getAppsByIds(appIds) {
  return appIds.map(getAppById).filter(Boolean);
}

function getAppsByCategory(category) {
  return state.apps.filter((app) => app.category === category);
}

function setMainSectionsVisibility({
  hero = false,
  quickActions = false,
  launcherSearch = true,
  favorites = false,
  recentlyUsed = false,
  library = true
} = {}) {
  [
    [elements.heroCard, hero],
    [elements.quickActionsSection, quickActions],
    [elements.launcherSearchPanel, launcherSearch],
    [elements.favoritesSection, favorites],
    [elements.recentlyUsedSection, recentlyUsed],
    [elements.libraryToolbar, library],
    [elements.appGrid, library]
  ].forEach(([element, visible]) => {
    element.hidden = !visible;
    element.style.display = visible ? "" : "none";
  });
}

function setLibraryHeading(kicker, title) {
  elements.libraryKicker.textContent = kicker;
  elements.libraryTitle.textContent = title;
}

function setActiveNavigation(activeId) {
  menuItems.forEach((item) => {
    item.active = item.id === activeId;
  });

  document.querySelectorAll("[data-nav-id]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.navId === activeId);
  });
}

function resetLauncherSearch() {
  state.launcherQuery = "";
  elements.launcherSearch.value = "";
}

function recordAppOpen(appId) {
  const recentIds = readStorage(CONFIG.storageKeys.recentApps, []);
  const nextRecentIds = [appId, ...recentIds.filter((id) => id !== appId)].slice(0, 10);
  writeStorage(CONFIG.storageKeys.recentApps, nextRecentIds);
  renderLauncher();
}

function setLaunchLoading(appId) {
  document.querySelectorAll(`[data-app-id="${appId}"]`).forEach((node) => {
    node.classList.add("is-launching");
    node.closest(".app-card")?.classList.add("is-launching");
  });

  window.setTimeout(() => {
    document.querySelectorAll(`[data-app-id="${appId}"]`).forEach((node) => {
      node.classList.remove("is-launching");
      node.closest(".app-card")?.classList.remove("is-launching");
    });
  }, 650);
}

function launchApp(app) {
  if (!app) {
    return;
  }

  recordAppOpen(app.id);
  setLaunchLoading(app.id);

  if (app.launchMode === "workspace" && app.workspacePath) {
    window.location.href = app.workspacePath;
    return;
  }

  window.open(app.url, "_blank", "noopener,noreferrer");
}

function renderNavigation() {
  elements.navigation.innerHTML = menuItems
    .map(
      (item) => `
        <a class="nav-item ${item.active ? "is-active" : ""}" href="#${item.id}" data-nav-id="${item.id}" data-tooltip="${item.label}">
          <span>${createIcon(item.icon)}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `
    )
    .join("");
}

function createAppCard(app, variant = "library") {
  const colorClass = colorClassMap[app.color] || colorClassMap.blue;
  const status = getStatus(app);
  const favorite = isFavorite(app);

  return `
    <article class="app-card ${colorClass} ${variant === "compact" ? "is-compact" : ""}">
      <a
        href="${getLaunchHref(app)}"
        target="_blank"
        rel="noopener noreferrer"
        data-app-id="${app.id}"
        data-launch-mode="${app.launchMode || "external"}"
        aria-label="Mở ${app.name} trong tab mới"
      >
        <div class="card-topline">
          <span class="app-icon">${createIcon(app.icon)}</span>
          <span class="app-status ${status.className}">${status.dot} ${status.label}</span>
        </div>
        <div>
          <h3>${app.name}</h3>
          <p>${app.description}</p>
        </div>
        <div class="app-meta">
          <span>${app.category}</span>
          <span>v${app.version}</span>
        </div>
        <div class="card-footer">
          <span>${app.owner}</span>
          <span>Open ${createIcon("external-link")}</span>
        </div>
      </a>
      <button class="favorite-toggle ${favorite ? "is-favorite" : ""}" type="button" data-favorite-id="${app.id}" aria-label="${favorite ? "Bỏ ghim" : "Ghim"} ${app.name}">
        ${createIcon("star")}
      </button>
    </article>
  `;
}

function renderQuickLaunch(apps) {
  const quickApps = [...getRecentApps(), ...apps.filter((app) => !getRecentApps().some((recent) => recent.id === app.id))].slice(0, 4);

  elements.quickLaunch.innerHTML = quickApps
    .map(
      (app) => `
        <a href="${getLaunchHref(app)}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}" data-tooltip="${app.name}">
          ${createIcon(app.icon)}
          <span>${app.name}</span>
        </a>
      `
    )
    .join("");
}

function renderQuickActions(apps) {
  elements.quickActions.innerHTML = apps
    .slice(0, 4)
    .map(
      (app) => `
        <a class="quick-action ${colorClassMap[app.color] || "is-blue"}" href="${getLaunchHref(app)}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
          <span>${createIcon(app.icon)}</span>
          <strong>${app.name}</strong>
          <small>v${app.version}</small>
        </a>
      `
    )
    .join("");
}

function renderTodayApps(apps) {
  const todayApps = [...getRecentApps(), ...apps.filter((app) => !getRecentApps().some((recent) => recent.id === app.id))].slice(0, 4);

  elements.todayApps.innerHTML = todayApps
    .map(
      (app) => `
        <a href="${getLaunchHref(app)}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
          ${createIcon(app.icon)}
          <span>${app.name}</span>
        </a>
      `
    )
    .join("");
}

function renderRecentActivity() {
  const recentApps = getRecentApps();

  if (recentApps.length === 0) {
    elements.recentActivity.innerHTML = `
      <li class="empty-activity">Chưa có ứng dụng nào được mở.</li>
    `;
    return;
  }

  elements.recentActivity.innerHTML = recentApps
    .slice(0, 10)
    .map(
      (app) => `
        <li>
          <a href="${getLaunchHref(app)}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
            ${createIcon(app.icon)}
            <span>${app.name}</span>
          </a>
        </li>
      `
    )
    .join("");
}

function renderWorkspaceMemory() {
  const [lastApp] = getRecentApps();

  if (!lastApp) {
    elements.continueWidget.hidden = true;
    return;
  }

  elements.continueWidget.hidden = false;
  elements.continueLink.href = getLaunchHref(lastApp);
  elements.continueLink.target = "_blank";
  elements.continueLink.rel = "noopener noreferrer";
  elements.continueLink.dataset.appId = lastApp.id;
  elements.continueName.textContent = lastApp.name;
}

function renderFavorites() {
  const favoriteApps = state.filteredApps.filter(isFavorite);
  elements.favoriteCount.textContent = `${favoriteApps.length} pinned`;

  elements.favoriteGrid.innerHTML = favoriteApps.length
    ? favoriteApps.map((app) => createAppCard(app, "compact")).join("")
    : `<div class="empty-state compact-empty"><strong>Chưa có favorites</strong><span>Nhấn biểu tượng sao trên card để ghim ứng dụng.</span></div>`;
}

function renderRecentlyUsedGrid() {
  const recentApps = getRecentApps().filter((app) => state.filteredApps.some((filtered) => filtered.id === app.id));
  elements.recentCount.textContent = `${recentApps.length} recent`;

  elements.recentGrid.innerHTML = recentApps.length
    ? recentApps.slice(0, 4).map((app) => createAppCard(app, "compact")).join("")
    : `<div class="empty-state compact-empty"><strong>Chưa có recently used</strong><span>Các ứng dụng vừa mở sẽ xuất hiện tại đây.</span></div>`;
}

function renderLibrary(apps = state.filteredApps) {
  elements.appGrid.innerHTML = apps.length
    ? apps.map((app) => createAppCard(app)).join("")
    : `<div class="empty-state"><strong>Không tìm thấy ứng dụng</strong><span>Thử tìm bằng tên hoặc danh mục khác.</span></div>`;

  elements.appCount.textContent = `${apps.length} ứng dụng`;
}

function renderAppGroups(groups) {
  const visibleGroups = groups
    .map((group) => ({ ...group, apps: filterApps(group.apps) }))
    .filter((group) => group.apps.length > 0);
  const appTotal = visibleGroups.reduce((total, group) => total + group.apps.length, 0);

  elements.appGrid.innerHTML = visibleGroups.length
    ? visibleGroups
        .map(
          (group) => `
            <section class="favorites-section">
              <div class="toolbar compact-toolbar">
                <div>
                  <span class="section-kicker">${group.kicker}</span>
                  <h2>${group.title}</h2>
                </div>
                <div class="status-pill">${group.apps.length} ứng dụng</div>
              </div>
              <div class="app-grid">
                ${group.apps.map((app) => createAppCard(app)).join("")}
              </div>
            </section>
          `
        )
        .join("")
    : `<div class="empty-state"><strong>Không tìm thấy ứng dụng</strong><span>Thử tìm bằng tên hoặc danh mục khác.</span></div>`;

  elements.appCount.textContent = `${appTotal} ứng dụng`;
}

function renderResearchPlaceholder() {
  elements.appGrid.innerHTML = `
    <article class="app-card is-blue">
      <a href="#research" aria-label="Research Workspace">
        <div class="card-topline">
          <span class="app-icon">${createIcon("microscope")}</span>
          <span class="app-status status-beta">🟡 Planned</span>
        </div>
        <div>
          <h3>Research Workspace</h3>
          <p>Future modules will appear here.</p>
        </div>
        <div class="app-meta">
          <span>Research</span>
          <span>Reserved</span>
        </div>
        <div class="card-footer">
          <span>Radiology Workspace</span>
          <span>Coming Soon ${createIcon("sparkles")}</span>
        </div>
      </a>
    </article>
  `;
  elements.appCount.textContent = "0 ứng dụng";
}

function renderSettingsPage() {
  const themeLabel = document.documentElement.dataset.theme === "dark" ? "Dark Mode" : "Light Mode";

  elements.appGrid.innerHTML = `
    <article class="app-card is-blue">
      <a href="#settings" aria-label="Settings">
        <div class="card-topline">
          <span class="app-icon">${createIcon("settings")}</span>
          <span class="app-status status-online">🟢 Active</span>
        </div>
        <div>
          <h3>Settings</h3>
          <p>Reserve this workspace for future development.</p>
        </div>
        <div class="app-meta">
          <span>Version</span>
          <span>3.2</span>
        </div>
        <div class="card-footer">
          <span>Theme: ${themeLabel}</span>
          <span>About Radiology Workspace</span>
        </div>
      </a>
    </article>
  `;
  elements.appCount.textContent = "Settings";
}

function renderHome() {
  setMainSectionsVisibility({
    hero: true,
    quickActions: true,
    launcherSearch: true,
    favorites: true,
    recentlyUsed: true,
    library: true
  });
  setLibraryHeading("Application Library", "Ứng dụng nội bộ");
  state.filteredApps = getFilteredApps();
  renderQuickLaunch(state.apps);
  renderQuickActions(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderFavorites();
  renderRecentlyUsedGrid();
  renderLibrary();
  renderSearchResults();
  refreshIcons();
}

function renderClinical() {
  setMainSectionsVisibility({ launcherSearch: true, library: true });
  setLibraryHeading("Workspace", "Clinical");
  state.filteredApps = filterApps(getAppsByCategory("Clinical"));
  renderQuickLaunch(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderLibrary(state.filteredApps);
  renderSearchResults();
  refreshIcons();
}

function renderAdministration() {
  setMainSectionsVisibility({ launcherSearch: true, library: true });
  setLibraryHeading("Workspace", "Administration");
  renderQuickLaunch(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderAppGroups([
    {
      kicker: "Radiology Workspace",
      title: "Radiology Workspace",
      apps: getAppsByIds(["dashboard", "cham-cong", "giao-ban", "phan-ca"])
    },
    {
      kicker: "Hospital Systems",
      title: "Hospital Systems",
      apps: getAppsByIds(["ontime-app", "cham-cong-don-vi", "bach-mai-office", "fast"])
    },
    {
      kicker: "Quality & Safety",
      title: "Quality & Safety",
      apps: getAppsByIds(["bao-cao-adr", "bao-cao-su-co-y-khoa"])
    }
  ]);
  renderSearchResults();
  refreshIcons();
}

function renderResearch() {
  const researchApps = filterApps(getAppsByCategory("Research"));
  setMainSectionsVisibility({ launcherSearch: true, library: true });
  setLibraryHeading("Workspace", "Research");
  renderQuickLaunch(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();

  if (researchApps.length > 0) {
    renderLibrary(researchApps);
  } else {
    renderResearchPlaceholder();
  }

  renderSearchResults();
  refreshIcons();
}

function renderFavoritesPage() {
  setMainSectionsVisibility({ launcherSearch: true, library: true });
  setLibraryHeading("Workspace", "Favorites");
  state.filteredApps = filterApps(state.apps).filter(isFavorite);
  renderQuickLaunch(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderLibrary(state.filteredApps);
  renderSearchResults();
  refreshIcons();
}

function renderSettings() {
  setMainSectionsVisibility({ launcherSearch: false, library: true });
  setLibraryHeading("Workspace", "Settings");
  renderQuickLaunch(state.apps);
  renderTodayApps(state.apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderSettingsPage();
  renderSearchResults();
  refreshIcons();
}

function renderLauncher() {
  const renderers = {
    home: renderHome,
    operations: renderAdministration,
    clinical: renderClinical,
    research: renderResearch,
    favorites: renderFavoritesPage,
    settings: renderSettings
  };

  const renderView = renderers[state.currentView] || renderHome;
  renderView();
}

function renderApps(apps) {
  state.apps = apps;
  renderLauncher();
}

function renderEmptyState() {
  elements.appGrid.innerHTML = `
    <div class="empty-state">
      <strong>Chưa tải được danh sách ứng dụng</strong>
      <span>Vui lòng kiểm tra file apps.json hoặc chạy qua local server.</span>
    </div>
  `;
  elements.appCount.textContent = "0 ứng dụng";
}

function getGreeting(date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: CONFIG.timeZone
    }).format(date)
  );

  if (hour < 12) {
    return "☀️ Chào buổi sáng BS Thanh Vũ";
  }

  if (hour < 18) {
    return "🌇 Chào buổi chiều BS Thanh Vũ";
  }

  return "🌙 Chào buổi tối BS Thanh Vũ";
}

function updateClock() {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat(CONFIG.locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: CONFIG.timeZone
  });
  const timeFormatter = new Intl.DateTimeFormat(CONFIG.locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: CONFIG.timeZone
  });
  const greeting = getGreeting(now);

  elements.currentDate.textContent = dateFormatter.format(now);
  elements.currentTime.textContent = timeFormatter.format(now);
  elements.heroGreeting.textContent = greeting;
  elements.todayGreeting.textContent = greeting;
}

function getSearchMatches() {
  const query = elements.globalSearch.value.trim().toLowerCase();

  if (!query) {
    return state.apps;
  }

  return state.apps.filter((app) => getSearchText(app).includes(query));
}

function renderSearchResults() {
  const matches = getSearchMatches();
  state.searchIndex = Math.min(state.searchIndex, Math.max(matches.length - 1, 0));

  if (matches.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="search-empty">
        <strong>Không tìm thấy ứng dụng</strong>
        <span>Thử tìm bằng tên, mô tả hoặc category.</span>
      </div>
    `;
    return;
  }

  elements.searchResults.innerHTML = matches
    .map(
      (app, index) => `
        <button class="search-result ${index === state.searchIndex ? "is-selected" : ""}" type="button" data-search-app-id="${app.id}" role="option">
          <span class="result-icon">${createIcon(app.icon)}</span>
          <span>
            <strong>${app.name}</strong>
            <small>${app.category} • v${app.version}</small>
          </span>
          <kbd>Enter</kbd>
        </button>
      `
    )
    .join("");
  refreshIcons();
}

function openSearch() {
  state.searchOpen = true;
  state.searchIndex = 0;
  elements.commandOverlay.classList.add("is-open");
  elements.commandOverlay.setAttribute("aria-hidden", "false");
  renderSearchResults();
  window.setTimeout(() => elements.globalSearch.focus(), 80);
}

function closeSearch() {
  state.searchOpen = false;
  elements.commandOverlay.classList.remove("is-open");
  elements.commandOverlay.setAttribute("aria-hidden", "true");
  elements.globalSearch.value = "";
}

function openSelectedSearchResult() {
  const matches = getSearchMatches();
  launchApp(matches[state.searchIndex]);
  closeSearch();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  elements.themeToggle.setAttribute("aria-label", theme === "dark" ? "Tắt Dark Mode" : "Bật Dark Mode");
  elements.themeToggle.innerHTML = createIcon(theme === "dark" ? "sun" : "moon");
  writeStorage(CONFIG.storageKeys.theme, theme);
  refreshIcons();
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function applySidebarState(collapsed) {
  elements.shell.classList.toggle("is-sidebar-collapsed", collapsed);
  elements.sidebarToggle.setAttribute("aria-label", collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar");
  elements.sidebarToggle.title = collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar";
  elements.sidebarToggle.innerHTML = createIcon(collapsed ? "panel-left-open" : "panel-left-close");
  writeStorage(CONFIG.storageKeys.sidebar, collapsed);
  refreshIcons();
}

function toggleSidebar() {
  applySidebarState(!elements.shell.classList.contains("is-sidebar-collapsed"));
}

function switchView(viewId) {
  state.currentView = viewId;
  resetLauncherSearch();
  setActiveNavigation(viewId);
  renderLauncher();
}

function bindEvents() {
  elements.commandButton.addEventListener("click", openSearch);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.sidebarToggle.addEventListener("click", toggleSidebar);

  elements.launcherSearch.addEventListener("input", () => {
    state.launcherQuery = elements.launcherSearch.value;
    renderLauncher();
  });

  elements.clearSearch.addEventListener("click", () => {
    elements.launcherSearch.value = "";
    state.launcherQuery = "";
    renderLauncher();
    elements.launcherSearch.focus();
  });

  elements.globalSearch.addEventListener("input", () => {
    state.searchIndex = 0;
    renderSearchResults();
  });

  elements.searchResults.addEventListener("click", (event) => {
    const result = event.target.closest("[data-search-app-id]");
    if (result) {
      launchApp(getAppById(result.dataset.searchAppId));
      closeSearch();
    }
  });

  elements.commandOverlay.addEventListener("click", (event) => {
    if (event.target === elements.commandOverlay) {
      closeSearch();
    }
  });

  document.addEventListener("click", (event) => {
    const navItem = event.target.closest("[data-nav-id]");
    if (navItem) {
      event.preventDefault();
      switchView(navItem.dataset.navId);
      return;
    }

    const favoriteButton = event.target.closest("[data-favorite-id]");
    if (favoriteButton) {
      const app = getAppById(favoriteButton.dataset.favoriteId);
      persistFavorite(app.id, !isFavorite(app));
      renderLauncher();
      return;
    }

    const appLink = event.target.closest("a[data-app-id]");
    if (appLink) {
      const app = getAppById(appLink.dataset.appId);
      event.preventDefault();
      launchApp(app);
    }
  });

  document.addEventListener("keydown", (event) => {
    const isCommandK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

    if (isCommandK) {
      event.preventDefault();
      openSearch();
      return;
    }

    if (!state.searchOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const matches = getSearchMatches();
      state.searchIndex = Math.min(state.searchIndex + 1, matches.length - 1);
      renderSearchResults();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.searchIndex = Math.max(state.searchIndex - 1, 0);
      renderSearchResults();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openSelectedSearchResult();
    }
  });
}

async function loadApps() {
  try {
    const response = await fetch(CONFIG.appsSource, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Không tải được ${CONFIG.appsSource}`);
    }

    const data = await response.json();
    renderApps(data.apps || []);
  } catch (error) {
    console.error(error);
    renderEmptyState();
  }
}

function initPreferences() {
  const savedTheme = readStorage(CONFIG.storageKeys.theme, "light");
  const collapsedSidebar = readStorage(CONFIG.storageKeys.sidebar, false);
  applyTheme(savedTheme === "dark" ? "dark" : "light");
  applySidebarState(Boolean(collapsedSidebar));
}

function init() {
  renderNavigation();
  bindEvents();
  initPreferences();
  updateClock();
  loadApps();
  window.setInterval(updateClock, 1000);
}

init();
