const CONFIG = {
  appsSource: "apps.json",
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh",
  storageKeys: {
    theme: "radiology-workspace-theme",
    recentApps: "radiology-workspace-recent-apps",
    sidebar: "radiology-workspace-sidebar"
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

const iconMap = {
  "phan-ca": "calendar-days",
  dashboard: "bar-chart-3",
  "cham-cong": "clock-3",
  "giao-ban": "users-round"
};

const colorClassMap = {
  blue: "is-blue",
  green: "is-green",
  orange: "is-orange",
  red: "is-red"
};

const state = {
  apps: [],
  searchOpen: false,
  searchIndex: 0
};

const elements = {
  shell: document.querySelector("#workspace-shell"),
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  navigation: document.querySelector("#navigation"),
  quickLaunch: document.querySelector("#quick-launch"),
  quickActions: document.querySelector("#quick-actions"),
  todayApps: document.querySelector("#today-apps"),
  recentActivity: document.querySelector("#recent-activity"),
  continueWidget: document.querySelector("#continue-widget"),
  continueLink: document.querySelector("#continue-link"),
  continueName: document.querySelector("#continue-name"),
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
  return `<i class="${className}" data-lucide="${name}" aria-hidden="true"></i>`;
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

function getAppById(appId) {
  return state.apps.find((app) => app.id === appId);
}

function getRecentApps() {
  const recentIds = readStorage(CONFIG.storageKeys.recentApps, []);
  return recentIds.map(getAppById).filter(Boolean);
}

function recordAppOpen(appId) {
  const recentIds = readStorage(CONFIG.storageKeys.recentApps, []);
  const nextRecentIds = [appId, ...recentIds.filter((id) => id !== appId)].slice(0, 10);
  writeStorage(CONFIG.storageKeys.recentApps, nextRecentIds);
  renderWorkspaceMemory();
  renderRecentActivity();
  renderQuickLaunch(state.apps);
  refreshIcons();
}

function openApp(app) {
  if (!app) {
    return;
  }

  recordAppOpen(app.id);
  window.open(app.url, "_blank", "noopener,noreferrer");
}

function renderNavigation() {
  elements.navigation.innerHTML = menuItems
    .map(
      (item) => `
        <a class="nav-item ${item.active ? "is-active" : ""}" href="#${item.id}" data-tooltip="${item.label}">
          <span>${createIcon(item.icon)}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `
    )
    .join("");
}

function createAppCard(app) {
  const colorClass = colorClassMap[app.color] || colorClassMap.blue;
  const iconName = iconMap[app.id] || "app-window";

  return `
    <article class="app-card ${colorClass}">
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}" aria-label="Mở ${app.name} trong tab mới">
        <div class="card-topline">
          <span class="app-icon">${createIcon(iconName)}</span>
          <span class="badge">${app.category}</span>
        </div>
        <div>
          <h3>${app.name}</h3>
          <p>${app.description}</p>
        </div>
        <div class="card-footer">
          <span>${app.badge}</span>
          <span>Open ${createIcon("arrow-right")}</span>
        </div>
      </a>
    </article>
  `;
}

function renderQuickLaunch(apps) {
  const recentApps = getRecentApps();
  const quickApps = [...recentApps, ...apps.filter((app) => !recentApps.some((recent) => recent.id === app.id))].slice(0, 4);

  elements.quickLaunch.innerHTML = quickApps
    .map(
      (app) => `
        <a href="${app.url}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}" data-tooltip="${app.name}">
          ${createIcon(iconMap[app.id] || "circle-dot")}
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
        <a class="quick-action ${colorClassMap[app.color] || "is-blue"}" href="${app.url}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
          <span>${createIcon(iconMap[app.id] || "app-window")}</span>
          <strong>${app.name}</strong>
        </a>
      `
    )
    .join("");
}

function renderTodayApps(apps) {
  const recentApps = getRecentApps();
  const todayApps = [...recentApps, ...apps.filter((app) => !recentApps.some((recent) => recent.id === app.id))].slice(0, 4);

  elements.todayApps.innerHTML = todayApps
    .map(
      (app) => `
        <a href="${app.url}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
          ${createIcon(iconMap[app.id] || "app-window")}
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
    .map(
      (app) => `
        <li>
          <a href="${app.url}" target="_blank" rel="noopener noreferrer" data-app-id="${app.id}">
            ${createIcon(iconMap[app.id] || "history")}
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
  elements.continueLink.href = lastApp.url;
  elements.continueLink.dataset.appId = lastApp.id;
  elements.continueName.textContent = lastApp.name;
}

function renderApps(apps) {
  state.apps = apps;
  elements.appGrid.innerHTML = apps.map(createAppCard).join("");
  elements.appCount.textContent = `${apps.length} ứng dụng`;
  renderQuickLaunch(apps);
  renderQuickActions(apps);
  renderTodayApps(apps);
  renderRecentActivity();
  renderWorkspaceMemory();
  renderSearchResults();
  refreshIcons();
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

  return state.apps.filter((app) =>
    [app.name, app.description, app.category, app.badge]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
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
        <button class="search-result ${index === state.searchIndex ? "is-selected" : ""}" type="button" data-app-id="${app.id}" role="option">
          <span class="result-icon">${createIcon(iconMap[app.id] || "app-window")}</span>
          <span>
            <strong>${app.name}</strong>
            <small>${app.description}</small>
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
  openApp(matches[state.searchIndex]);
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

function bindEvents() {
  elements.commandButton.addEventListener("click", openSearch);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.sidebarToggle.addEventListener("click", toggleSidebar);

  elements.globalSearch.addEventListener("input", () => {
    state.searchIndex = 0;
    renderSearchResults();
  });

  elements.searchResults.addEventListener("click", (event) => {
    const result = event.target.closest("[data-app-id]");
    if (result) {
      openApp(getAppById(result.dataset.appId));
      closeSearch();
    }
  });

  elements.commandOverlay.addEventListener("click", (event) => {
    if (event.target === elements.commandOverlay) {
      closeSearch();
    }
  });

  document.addEventListener("click", (event) => {
    const appLink = event.target.closest("a[data-app-id]");
    if (appLink) {
      recordAppOpen(appLink.dataset.appId);
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
    const response = await fetch(CONFIG.appsSource);

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
