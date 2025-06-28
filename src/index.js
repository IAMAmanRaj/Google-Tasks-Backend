require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();


app.use(
  cors({
    origin: ["http://localhost:5173", "https://staging-irys.skdiv.com"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the Google OAuth 2.0 Integration API");
});

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    // Send tokens back to frontend as a redirect with query
    const tokens = encodeURIComponent(JSON.stringify(tokenRes.data));
    res.redirect(`https://staging-irys.skdiv.com/settings?tab=data-sync&token=${tokens}`);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.status(500).send('Token exchange failed');
  }
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});