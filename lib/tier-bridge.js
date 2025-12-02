// tier-bridge.js
(function(){
  var STORAGE_KEY = 'go_tier';

  function readTier(){
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (!v) return 'free';
      v = String(v).toLowerCase();
      if (v !== 'pro' && v !== 'free') return 'free';
      return v;
    } catch(e){
      return 'free';
    }
  }

  function writeTier(tier){
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch(e){}
  }

  function emitTierChanged(newTier, extra){
    var detail = extra || {};
    detail.tier = newTier;

    var ev;
    try {
      ev = new CustomEvent('tier:changed', { detail: detail });
    } catch (e) {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('tier:changed', true, true, detail);
    }
    window.dispatchEvent(ev);
  }

  var GoTier = window.GoTier || {};

  GoTier.get = GoTier.get || function(){
    return readTier();
  };

  // Call this from your paywall / app-store success handler
  GoTier.set = function(tier, extra){
    tier = String(tier || 'free').toLowerCase();
    if (tier !== 'pro' && tier !== 'free') tier = 'free';

    var prev = readTier();
    if (prev === tier){
      // Nothing changed, no need to spam events.
      return;
    }

    writeTier(tier);
    emitTierChanged(tier, extra || { source: 'set' });
  };

  // Cross-tab support if something else writes localStorage("go_tier")
  window.addEventListener('storage', function(e){
    if (!e.key || e.key === STORAGE_KEY){
      var newTier = readTier();
      emitTierChanged(newTier, { source: 'storage' });
    }
  });

  window.GoTier = GoTier;
})();
