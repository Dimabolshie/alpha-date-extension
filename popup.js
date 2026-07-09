document.addEventListener('DOMContentLoaded', () => {
  console.log('=== POPUP ЗАГРУЗИЛСЯ ===');

  // === AI ПОМОЩНИК ===
  const generateBtn = document.getElementById('generate-btn');
  const outputDiv = document.getElementById('output');
  const taskType = document.getElementById('task-type');
  const promptInput = document.getElementById('prompt');
  const extraContext = document.getElementById('extra-context');
  const apiKeyInput = document.getElementById('api-key');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const howToLink = document.getElementById('how-to-get-key');
  const apiHeader = document.getElementById('api-header');
  const apiSection = document.getElementById('api-section');
  const apiToggle = document.getElementById('api-toggle');

  chrome.storage.local.get(['groqApiKey'], (result) => {
    if (result.groqApiKey && apiKeyInput) apiKeyInput.value = result.groqApiKey;
  });

  if (saveKeyBtn && apiKeyInput) {
    saveKeyBtn.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) return alert('Вставь API ключ');
      chrome.storage.local.set({ groqApiKey: key }, () => alert('Ключ сохранён!'));
    });
  }

  if (howToLink) {
    howToLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert(`Как получить бесплатный Groq API ключ:\n\n1. Перейди на https://console.groq.com/keys\n2. Войди через Google\n3. Нажми "Create API Key"\n4. Скопируй ключ (gsk_...)\n\nВставь его выше и нажми "Сохранить ключ".`);
    });
  }

  if (apiHeader && apiSection && apiToggle) {
    apiHeader.addEventListener('click', () => {
      apiSection.classList.toggle('hidden');
      apiToggle.textContent = apiSection.classList.contains('hidden') ? '▼' : '▲';
    });
  }

  // === Автозаполнение из профиля ===
  chrome.storage.local.get(['pendingProfileAI'], (result) => {
    if (result.pendingProfileAI && promptInput) {
      const { name, about } = result.pendingProfileAI;

      let promptText = '';
      if (name) promptText += `Мужчина: ${name}\n`;
      if (about) promptText += `Информация из профиля:\n${about}\n\n`;
      promptText += 'Напиши естественное, тёплое и интересное первое сообщение этому человеку.';

      promptInput.value = promptText;
      chrome.storage.local.remove('pendingProfileAI');
    }
  });

  // Генерация
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const task = taskType ? taskType.value : 'message';
      const prompt = promptInput ? promptInput.value.trim() : '';
      const context = extraContext ? extraContext.value.trim() : '';
      const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

      if (!prompt) return alert('Пожалуйста, введи запрос');
      if (!apiKey) return alert('Сначала сохрани Groq API ключ');

      if (outputDiv) {
        outputDiv.style.display = 'block';
        outputDiv.innerHTML = 'Генерирую...';
      }

      const systemPrompt = getSystemPrompt(task);
      let userMessage = `Тип задачи: ${task}\n\nЗапрос: ${prompt}`;
      if (context) userMessage += `\n\nДополнительный контекст: ${context}`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.75,
            max_tokens: 650
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `Ошибка ${res.status}`);
        }

        const data = await res.json();
        const result = (data.choices && data.choices[0]) 
          ? data.choices[0].message.content 
          : 'Ошибка: пустой ответ';

        if (outputDiv) outputDiv.innerHTML = result;

      } catch (err) {
        if (outputDiv) outputDiv.innerHTML = 'Ошибка: ' + err.message;
      }
    });
  }

  // === ИГРОВОЙ АВТОМАТ ===
  const symbols = ['7️⃣', '❤️', '☠️', '😼', '🫶', '🤬', '💰', '🔥'];
  const winMessages = [
    "Хорошей смены!",
    "Больших балансов!",
    "Что бы админ не ругался",
    "Желаю удачи!",
    "Больше зеленых!",
    "Больше подарков!",
    "Слушайтесь Админа"
  ];

  const spinBtn = document.getElementById('spin-btn');
  const reel1 = document.getElementById('reel1');
  const reel2 = document.getElementById('reel2');
  const reel3 = document.getElementById('reel3');
  const resultBox = document.getElementById('slot-result');

  if (spinBtn && reel1 && reel2 && reel3 && resultBox) {
    spinBtn.addEventListener('click', () => {
      spinBtn.disabled = true;
      resultBox.innerHTML = '';
      resultBox.style.color = '#e2e8f0';

      let spins = 0;
      const spinInterval = setInterval(() => {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        spins++;
        if (spins > 15) clearInterval(spinInterval);
      }, 70);

      setTimeout(() => {
        clearInterval(spinInterval);

        const final = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];

        reel1.textContent = final[0];
        reel2.textContent = final[1];
        reel3.textContent = final[2];

        if (final[0] === final[1] && final[1] === final[2]) {
          const msg = winMessages[Math.floor(Math.random() * winMessages.length)];
          resultBox.innerHTML = `🎉 <b>${msg}</b>`;
          resultBox.style.color = '#4ade80';
        } else {
          resultBox.innerHTML = 'Повезёт в следующий раз...';
          resultBox.style.color = '#94a3b8';
        }
        spinBtn.disabled = false;
      }, 1300);
    });
  }

  // Справка
  const helpToggle = document.getElementById('help-toggle');
  const helpText = document.getElementById('help-text');

  if (helpToggle && helpText) {
    helpToggle.addEventListener('click', () => {
      helpText.classList.toggle('hidden');
    });
  }
});

function getSystemPrompt(task) {
  // Специальный промпт для сообщений с профиля
  if (task === "message_with_profile") {
    return `Ты — девушка на сайте знакомств alpha.date. 
Пиши живые, тёплые, естественные сообщения. 
Избегай любых шаблонных фраз вроде "приветствую тебя на сайте", "рада тебя видеть", "желаю приятного общения".
Анализируй возраст мужчины, его описание "О себе" и раздел "Кого я ищу".
Задавай один интересный, конкретный и живой вопрос, который показывает, что ты внимательно прочитала профиль.
Пиши как обычная женщина 35–48 лет — с лёгким юмором, теплом и любопытством.`;
  }

  const base = "Ты полезный ассистент для сайта знакомств alpha.date. Пиши живые и естественные сообщения на русском языке без шаблонов.";
  if (task === "message") return base + " Пиши привлекательные первые сообщения.";
  if (task === "reply") return base + " Пиши естественные и тёплые ответы.";
  if (task === "invite_man") return base + " Пиши приятные инвайты.";
  if (task === "message_to_man") return base + " Пиши живые сообщения мужчинам.";
  return base;
}
