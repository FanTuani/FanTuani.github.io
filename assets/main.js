const API_URL = "https://api.mcsrvstat.us/3/ricequakes.top";
const REFRESH_INTERVAL = 300000;
const SERVER_ADDRESS = "ricequakes.top";

const elements = {
  statusPill: document.querySelector("#status-pill"),
  heroSummary: document.querySelector("#hero-summary"),
  heroOnlineCopy: document.querySelector("#hero-online-copy"),
  metricPlayers: document.querySelector("#metric-players"),
  metricVersion: document.querySelector("#metric-version"),
  metricHostname: document.querySelector("#metric-hostname"),
  statusSummary: document.querySelector("#status-summary"),
  detailHostname: document.querySelector("#detail-hostname"),
  detailIp: document.querySelector("#detail-ip"),
  detailPort: document.querySelector("#detail-port"),
  detailProtocol: document.querySelector("#detail-protocol"),
  detailUpdated: document.querySelector("#detail-updated"),
  detailState: document.querySelector("#detail-state"),
  motdPrimary: document.querySelector("#motd-primary"),
  motdSecondary: document.querySelector("#motd-secondary"),
  infoPrimary: document.querySelector("#info-primary"),
  infoSecondary: document.querySelector("#info-secondary"),
  copyButton: document.querySelector("#copy-button"),
  copyFeedback: document.querySelector("#copy-feedback"),
};

function sanitizeLine(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function getLines(values, fallback) {
  const lines = Array.isArray(values)
    ? values.map(sanitizeLine).filter(Boolean)
    : [];

  if (lines.length > 0) {
    return lines;
  }

  return fallback;
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function setViewState(state) {
  document.body.dataset.viewState = state;
}

function renderLoading() {
  setViewState("loading");
  elements.statusPill.textContent = "读取中";
  elements.heroSummary.textContent = "正在侦测这片方块大陆的空气、火把与玩家脚步声。";
  elements.heroOnlineCopy.textContent = "等待服务器回音...";
  elements.statusSummary.textContent = "正在等待远处的区块把当前状态传回来。";
  elements.detailState.textContent = "首次载入中";
  elements.copyFeedback.textContent = "";
}

function renderData(data) {
  const isOnline = Boolean(data?.online);
  const playerOnline = data?.players?.online;
  const playerMax = data?.players?.max;
  const hostname = sanitizeLine(data?.hostname) || SERVER_ADDRESS;
  const version = sanitizeLine(data?.version) || "未提供推荐版本";
  const protocolName = sanitizeLine(data?.protocol?.name);
  const protocolVersion = data?.protocol?.version;
  const ip = sanitizeLine(data?.ip) || "未提供";
  const port = data?.port ?? "未提供";
  const motdLines = getLines(data?.motd?.clean, [
    "这片世界暂时没有留下新的 MOTD。",
    "等下一次服务器回声抵达时，这里会更新。",
  ]);
  const infoLines = getLines(data?.info?.clean, [
    "目前没有额外的世界播报。",
    "也许下一次上线时，会有人正在等你。",
  ]);
  const timeLabel = `${formatTimestamp(new Date())} 更新`;

  setViewState(isOnline ? "online" : "offline");

  elements.statusPill.textContent = isOnline ? "在线中" : "暂时离线";
  elements.heroSummary.textContent = isOnline
    ? "世界在线，火把已点亮。现在可以直接进入这张地图。"
    : "信标还在，但这片世界暂时没有点亮。稍后再回来看看。";
  elements.heroOnlineCopy.textContent = isOnline
    ? `当前 ${playerOnline ?? "--"} 位玩家正在这片地形里活动。`
    : "服务器接口可达，但当前游戏世界没有响应在线状态。";
  elements.metricPlayers.textContent = `${playerOnline ?? "--"} / ${playerMax ?? "--"}`;
  elements.metricVersion.textContent = version;
  elements.metricHostname.textContent = hostname;

  elements.statusSummary.textContent = isOnline
    ? "状态正常，客户端可按下方地址直接尝试连接。"
    : "接口返回成功，但服务器当前未处于在线可游玩状态。";
  elements.detailHostname.textContent = hostname;
  elements.detailIp.textContent = ip;
  elements.detailPort.textContent = String(port);
  elements.detailProtocol.textContent = protocolName
    ? `${protocolName}${protocolVersion ? ` / ${protocolVersion}` : ""}`
    : protocolVersion
      ? String(protocolVersion)
      : "未提供";
  elements.detailUpdated.textContent = timeLabel;
  elements.detailState.textContent = isOnline ? "服务器在线，可尝试进入" : "服务器离线或未响应游戏连接";

  elements.motdPrimary.textContent = motdLines[0];
  elements.motdSecondary.textContent = motdLines[1] || "这条木牌没有留下第二行额外说明。";
  elements.infoPrimary.textContent = infoLines[0];
  elements.infoSecondary.textContent = infoLines[1] || "世界播报只留下了一句简短提示。";

  elements.copyFeedback.textContent = "";
}

function renderError() {
  setViewState("error");
  elements.statusPill.textContent = "连接失败";
  elements.heroSummary.textContent = "这次没有收到服务器回声，可能是网络波动，也可能是接口暂时失联。";
  elements.heroOnlineCopy.textContent = "状态读取失败，请稍后等待下一次自动刷新。";
  elements.metricPlayers.textContent = "-- / --";
  elements.metricVersion.textContent = "读取失败";
  elements.metricHostname.textContent = SERVER_ADDRESS;
  elements.statusSummary.textContent = "页面还在，但本次没有拿到可用数据。";
  elements.detailHostname.textContent = SERVER_ADDRESS;
  elements.detailIp.textContent = "无法获取";
  elements.detailPort.textContent = "无法获取";
  elements.detailProtocol.textContent = "无法获取";
  elements.detailUpdated.textContent = `${formatTimestamp(new Date())} 失败`;
  elements.detailState.textContent = "接口请求失败";
  elements.motdPrimary.textContent = "今晚的云层太厚，世界边界没有传回新的标语。";
  elements.motdSecondary.textContent = "页面会继续每 300 秒自动重试一次。";
  elements.infoPrimary.textContent = "请检查网络环境，或者稍后重新打开页面。";
  elements.infoSecondary.textContent = "如果你已经知道地址，也仍然可以直接在客户端尝试连接。";
  elements.copyFeedback.textContent = "状态请求失败，但复制地址功能仍可使用。";
}

async function fetchServerStatus() {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderData(data);
  } catch (error) {
    console.error("Failed to fetch server status:", error);
    renderError();
  }
}

async function copyServerAddress() {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(SERVER_ADDRESS);
    elements.copyFeedback.textContent = "地址已复制，去客户端里直接粘贴即可。";
  } catch (error) {
    console.error("Failed to copy server address:", error);
    elements.copyFeedback.textContent = "当前浏览器不支持自动复制，请手动复制 ricequakes.top。";
  }
}

elements.copyButton.addEventListener("click", copyServerAddress);

renderLoading();
fetchServerStatus();
setInterval(fetchServerStatus, REFRESH_INTERVAL);
