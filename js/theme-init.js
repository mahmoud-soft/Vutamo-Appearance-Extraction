(function () {
  try {
    var isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var icon = document.getElementById('dynamic-favicon');
    if (icon && isLight) {
      icon.href = 'assets/chrome/logo_new_tab_black.png';
    }
  } catch (e) { }
})();
