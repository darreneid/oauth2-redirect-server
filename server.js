const express = require('express');
const axios = require('axios');
const { jwtDecode } = require('jwt-decode');
const sql = require('./db');
const app = express();
const port = 5173;

app.get('/oauth/oauthcallback', async (req, res) => {
  // read authorization code at req.query.code
  // send post request to token endpoint using axios
  const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:5173/oauth/oauthcallback'
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // payload from Google returns an id_token, which I decode here in order to associate the token with a specific user
  const userEmail = jwtDecode(tokenResponse.data.id_token).email;
  // console.log(userEmail);
  const data = await sql`
    UPDATE users
    SET pinterest_token = ${tokenResponse.data}
    WHERE users.email = ${userEmail};
  `

  res.send('Success! You may now close this tab.');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
}); 