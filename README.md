# Google Tasks OAuth Backend

A minimal Node.js and Express backend for securely handling Google OAuth 2.0 token exchanges.  
This backend provides endpoints for Google authentication, allowing frontend applications to obtain access tokens for the Google Tasks API—while keeping your Google client credentials safe on the server.

## Project Structure

```
google-tasks-backend
├── src
│   └── index.js          # Entry point of the application; handles OAuth callback and server setup
├── package.json          # npm configuration and dependencies
├── package-lock.json     # Dependency lock file
├── vercel.json           # Vercel deployment configuration
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd google-tasks-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Google API credentials:**
   - Create a `.env` file in the root directory and add your Google API credentials:
     ```
     GOOGLE_CLIENT_ID=<your-client-id>
     GOOGLE_CLIENT_SECRET=<your-client-secret>
     GOOGLE_REDIRECT_URI=<your-redirect-uri>
     ```

4. **Run the application:**
   ```bash
   npm start
   ```

## Usage

### OAuth Authentication Flow

This backend implements the secure [Google OAuth 2.0 Authorization Code Flow](https://developers.google.com/identity/protocols/oauth2/web-server).  
Your client secret remains confidential and is never exposed to the frontend.

#### 1. User Authenticates via Google

After the user logs in and authorizes your app with Google, Google redirects the user’s browser to your backend’s callback route:

```
GET /auth/google/callback?code=AUTHORIZATION_CODE
```

#### 2. Backend Exchanges Code for Tokens

Your backend exchanges this code for access and refresh tokens by making a server-to-server `POST` request to Google’s token endpoint:

```js
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
```

- The `POST` body must include:
  - `grant_type=authorization_code`
  - `code=AUTHORIZATION_CODE` (from query param)
  - `redirect_uri=YOUR_BACKEND_CALLBACK` (must match what you registered with Google)
  - `client_id` and `client_secret` from your `.env`
- The `POST` headers must include:
  - `Content-Type: application/x-www-form-urlencoded`

On success, Google responds with:
- `access_token`
- `refresh_token`
- `expires_in`
- `scope`
- `token_type`

#### 3. Backend Redirects User to Frontend With Tokens

After obtaining tokens, your backend redirects the browser to your frontend, attaching the tokens as query parameters:

```
https://your-frontend-app/settings?tab=data-sync&token=...
```

The frontend can extract and securely store these tokens for use with Google APIs.

### Security Considerations

- Your **Google client secret is never exposed to the frontend or any user.**
- The **token exchange**—which requires your confidential credentials—**occurs exclusively on the backend** (server-to-server) over HTTPS.
- The frontend only receives temporary codes and tokens, never confidential credentials.
- This is the recommended and most secure approach for OAuth integrations with Google or any major provider.

## Deployment

This backend is deployed at  [Vercel deployment](https://google-tasks-backend-ix9z.vercel.app/) using the provided `vercel.json` configuration.

## License

This project is licensed under the ISC License.
