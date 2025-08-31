const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/hire-lawyer', async (req, res) => {
  const { user, message } = req.body;
  if (!user || !message) return res.status(400).send('Missing data');

  try {
    const fetchRes = await fetch('https://hiring-bot-6hjy.onrender.com/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user,
        messageText: message
      })
    });

    if (!fetchRes.ok) throw new Error('Bot endpoint failed');
    const data = await fetchRes.text();

    res.send(`Message sent! Bot responded: ${data}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending message');
  }
});
