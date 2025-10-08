let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

export default async function getAccessToken() {

    // Check if current accessToken is available and hasn't expired
    if (accessToken && Date.now() < tokenExpiresAt ) {
        return accessToken;
    } else {

        const clientID = process.env.SPOTIFY_API_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;

        console.log('Client ID exists:', !!clientID);
        console.log('Client Secret exists:', !!clientSecret);

        if (!clientID || !clientSecret) {
            console.error('Missing SPOTIFY_API_CLIENT_ID or SPOTIFY_API_CLIENT_SECRET');
            return null;
        }

        const credentials = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
        // console.log('Client Credentials: ', credentials);

        try {
            const res = await fetch(`https://accounts.spotify.com/api/token`, {
                method: 'POST',
                headers: {
                    Authorization: 
                        `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                }),
            })

            const data = await res.json();
            // console.log(data);

            if (!res.ok) {
                console.error('Failed to fetch access token: ', data);
                return null;
            }

            accessToken = data.access_token;
            tokenExpiresAt = Date.now() + data.expires_in * 1000;

            // console.log('Access Token: ', accessToken);

            return accessToken;

        } catch(err) {
            console.error(`Error fetching access token: ${err}`);
        }

    }

}