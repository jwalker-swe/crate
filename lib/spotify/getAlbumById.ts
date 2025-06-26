import getAccessToken from "./getAccessToken";

export default async function getAlbumById(id: string) {

    const token = await getAccessToken();

    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch album');
    }

    return res.json();
}