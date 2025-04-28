export async function refreshAccessToken() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const refreshToken = import.meta.env.VITE_GOOGLE_REFRESH_TOKEN;
  
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');
  
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to refresh access token: ${errorData.error}`);
    }
  
    const data = await response.json();
    return data.access_token;
}
  