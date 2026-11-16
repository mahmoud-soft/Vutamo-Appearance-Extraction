(function () {
  try {
    var bgType = localStorage.getItem('vutamo_bg_type');
    if (!bgType) {
      var rawSettings = localStorage.getItem('vutamo_appearance_settings');
      if (rawSettings) {
        var parsed = JSON.parse(rawSettings);
        if (parsed && parsed.bgType) {
          bgType = parsed.bgType;
        }
      }
    }

    var v = document.getElementById('bg-video');
    var img = document.getElementById('bg-image');

    if (!bgType || bgType === 'default') {
      if (v) {
        v.src = 'assets/videos/Background_1.mp4';
        v.muted = true;
        v.play().catch(function () { });
      }
    } else if (bgType === 'image') {
      var cachedImg = localStorage.getItem('vutamo_bg_cached_image');
      if (cachedImg && img) {
        img.style.backgroundImage = 'url("' + cachedImg + '")';
        img.classList.add('active');
      }
      if (v) {
        v.classList.add('hidden');
      }
    } else if (bgType === 'custom_video') {
      if (v) {
        v.classList.add('is-custom-video');
      }
    }
  } catch (e) { }
})();
