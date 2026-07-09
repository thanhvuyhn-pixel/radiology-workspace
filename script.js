const CONFIG = {
  appsSource: "apps.json",
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh"
};

const menuItems = [
  { id: "home", label: "Home", icon: "⌂", active: true },
  { id: "operations", label: "Điều hành", icon: "◇" },
  { id: "clinical", label: "Chuyên môn", icon: "＋" },
  { id: "research", label: "Nghiên cứu", icon: "⌁" },
  { id: "favorites", label: "Yêu thích", icon: "☆" },
  { id: "settings", label: "Cài đặt", icon: "⚙" }
];

const colorClassMap = {
  blue: "is-blue",
  green: "is-green",
  orange: "is-orange",
  red: "is-red"
};

const elements = {
  navigation: document.querySelector("#navigation"),
  appGrid: document.querySelector("#app-grid"),
  appCount: document.querySelector("#app-count"),
  currentDate: document.querySelector("#current-date"),
  currentTime: document.querySelector("#current-time")
};

function renderNavigation() {
  elements.navigation.innerHTML = menuItems
    .map(
      (item) => `
        <a class="nav-item ${item.active ? "is-active" : ""}" href="#${item.id}">
          <span aria-hidden="true">${item.icon}</span>
          ${item.label}
        </a>
      `
    )
    .join("");
}

function createAppCard(app) {
  const colorClass = colorClassMap[app.color] || colorClassMap.blue;

  return `
    <article class="app-card ${colorClass}">
      <a href="${app.url}" target="_blank" rel="noopener noreferrer" aria-label="Mở ${app.name} trong tab mới">
        <div class="card-topline">
          <span class="app-icon" aria-hidden="true">${app.icon}</span>
          <span class="badge">${app.badge}</span>
        </div>
        <div>
          <h3>${app.name}</h3>
          <p>${app.description}</p>
        </div>
        <div class="card-footer">
          <span>${app.category}</span>
          <span aria-hidden="true">↗</span>
        </div>
      </a>
    </article>
  `;
}

function renderApps(apps) {
  elements.appGrid.innerHTML = apps.map(createAppCard).join("");
  elements.appCount.textContent = `${apps.length} ứng dụng`;
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

  elements.currentDate.textContent = dateFormatter.format(now);
  elements.currentTime.textContent = timeFormatter.format(now);
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

function init() {
  renderNavigation();
  updateClock();
  loadApps();
  window.setInterval(updateClock, 1000);
}

init();
