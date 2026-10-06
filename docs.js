document.getElementById("year").textContent = new Date().getFullYear();

// Copy button on code blocks
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll(".doc pre").forEach((pre) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy-btn";
  btn.textContent = "Copy";
  btn.addEventListener("click", async () => {
    const text = pre.querySelector("code").innerText;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.textContent = "Copied!";
    showToast("Copied to clipboard");
    setTimeout(() => (btn.textContent = "Copy"), 1800);
  });
  const wrap = document.createElement("div");
  wrap.className = "code-block";
  pre.replaceWith(wrap);
  wrap.append(pre, btn);
});
