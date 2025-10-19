// Static password gate for GitHub Pages (front-end only)
(function(){
  const PASSWORD = "swlDash";
  const COOKIE_NAME = "op_gate";
  const MAX_AGE_DAYS = 7;
  const DEST = window.OP_DEST || "https://dash.openpeople.world/dash";

  function setCookie(name, value, days){
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  }

  function getCookie(name){
    return document.cookie
      .split(";")
      .map(v => v.trim())
      .find(v => v.startsWith(name + "="))
      ?.split("=")[1];
  }

  if (getCookie(COOKIE_NAME) === "1") {
    window.location.replace(DEST);
    return;
  }

  const form = document.getElementById("gate-form");
  const input = document.getElementById("gate-input");
  const error = document.getElementById("gate-error");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (error) error.hidden = true;
    const value = (input?.value || "").trim();
    if (value === PASSWORD) {
      setCookie(COOKIE_NAME, "1", MAX_AGE_DAYS);
      window.location.assign(DEST);
    } else {
      if (error) error.hidden = false;
      input?.focus();
      input?.select();
    }
  });
})();
