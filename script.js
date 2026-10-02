const MODRINTH_USER = "11fanatic11";

document.getElementById("year").textContent = new Date().getFullYear();

// Click-to-copy server IPs
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const ip = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(ip);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = ip;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const hint = btn.querySelector(".ip-hint");
    btn.classList.add("copied");
    hint.textContent = "Copied!";
    showToast(`Copied ${ip}`);
    setTimeout(() => {
      btn.classList.remove("copied");
      hint.textContent = "Copy";
    }, 1800);
  });
});

// Live server status via mcsrvstat.us
async function loadServerStatus() {
  const cards = [...document.querySelectorAll(".server[data-host]")];
  const counts = await Promise.all(cards.map(async (card) => {
    const status = card.querySelector("[data-status]");
    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${card.dataset.host}`);
      const data = await res.json();
      if (!data.online) {
        status.textContent = "Offline";
        status.className = "status offline";
        return 0;
      }
      status.textContent = "Online";
      status.className = "status online";
      card.querySelector("[data-players]").textContent = `${data.players.online}/${data.players.max}`;
      if (data.icon) card.querySelector(".server-icon").src = data.icon;
      return data.players.online;
    } catch {
      status.textContent = "Unknown";
      status.className = "status";
      return 0;
    }
  }));
  document.getElementById("fact-online").textContent = counts.reduce((a, b) => a + b, 0);
}

// Live mod list from Modrinth
const LOADER_NAMES = { fabric: "Fabric", neoforge: "NeoForge", forge: "Forge", quilt: "Quilt", paper: "Paper", spigot: "Spigot", bukkit: "Bukkit", purpur: "Purpur", velocity: "Velocity" };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function versionRange(versions) {
  const releases = versions.filter((v) => /^\d+(\.\d+)*$/.test(v));
  if (!releases.length) return null;
  return releases.length === 1 ? releases[0] : `${releases[0]} – ${releases[releases.length - 1]}`;
}

async function loadMods() {
  try {
    const res = await fetch(`https://api.modrinth.com/v2/user/${MODRINTH_USER}/projects`);
    if (!res.ok) return;
    const projects = (await res.json())
      .filter((p) => p.status === "approved")
      .sort((a, b) => b.downloads - a.downloads);
    if (!projects.length) return;

    const total = projects.reduce((sum, p) => sum + p.downloads, 0);
    // Same compact rounding Modrinth shows (e.g. 1,970 -> 2K)
    document.getElementById("fact-downloads").textContent =
      new Intl.NumberFormat("en", { notation: "compact" }).format(total);

    document.getElementById("mods-list").innerHTML = projects.map((p) => {
      const url = `https://modrinth.com/${p.project_type}/${p.slug}`;
      const tags = p.loaders.map((l) => LOADER_NAMES[l] || l);
      const range = versionRange(p.game_versions);
      if (range) tags.push(range);
      return `
        <article class="mod">
          <img class="mod-icon" src="${escapeHtml(p.icon_url || "assets/favicon.png")}" alt="" width="72" height="72" loading="lazy">
          <div class="mod-body">
            <h3><a href="${url}" target="_blank" rel="noopener">${escapeHtml(p.title)}</a></h3>
            <p>${escapeHtml(p.description)}</p>
            <div class="mod-tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
          </div>
          <div class="mod-stats"><b>${p.downloads.toLocaleString()}</b><span>downloads</span></div>
        </article>`;
    }).join("");
  } catch {
    // Keep the static fallback in the HTML
  }
}

// 2K celebration (temporary): pixel confetti on the banner
const confetti = document.querySelector(".celebrate-confetti");
if (confetti) {
  const colors = ["#e11d48", "#fb7185", "#fecdd3", "#ffffff", "#9f1239"];
  for (let i = 0; i < 28; i++) {
    const bit = document.createElement("i");
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
    bit.style.animationDuration = `${(2.5 + Math.random() * 2.5).toFixed(2)}s`;
    confetti.appendChild(bit);
  }
}

loadServerStatus();
loadMods();
