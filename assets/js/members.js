// Legacy placeholder to avoid Supabase errors from cached pages.
// If this script loads, send visitors to the current password gate.
(function () {
  const gateUrl = "/members/";
  if (window.location.pathname !== gateUrl) {
    window.location.replace(gateUrl);
  }
})();
