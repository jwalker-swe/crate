import getAccessToken from "@/lib/spotify/getAccessToken";

type AlbumWithPopularity = { album: any; popularity: number };

async function searchAlbumsByYear(token: string) {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const currentMonth = new Date().getMonth();
    const shouldIncludePreviousYear = currentMonth < 2;

    const searchQueries = shouldIncludePreviousYear
        ? [`year:${currentYear}`, `year:${previousYear}`]
        : [`year:${currentYear}`];

    const searchPromises = searchQueries.map(async (searchQuery) => {
        const encodedQuery = encodeURIComponent(searchQuery);
        const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;

        const res = await fetch(searchURL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                revalidate: 86400,
            },
        });

        const data = await res.json();
        return data.albums?.items ?? [];
    });

    const searchResults = await Promise.all(searchPromises);
    return searchResults.flat().filter((item: any) => item?.album_type === "album");
}

async function fetchAlbumDetailsAndRank(
    token: string,
    simplifiedAlbums: any[],
    minPopularity: number,
    since: Date | null
): Promise<AlbumWithPopularity[]> {
    let pool = simplifiedAlbums;
    if (since) {
        const filtered = pool.filter((album: any) => {
            const releaseDate = new Date(album.release_date);
            return releaseDate >= since;
        });
        if (filtered.length > 0) pool = filtered;
    }

    const albumIds = pool.map((a: any) => a.id);
    if (albumIds.length === 0) return [];

    const uniqueIds = [...new Set(albumIds)];
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 20) {
        chunks.push(uniqueIds.slice(i, i + 20));
    }

    const detailsArrays = await Promise.all(
        chunks.map((ids) =>
            fetch(`https://api.spotify.com/v1/albums?ids=${ids.join(",")}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                next: {
                    revalidate: 86400,
                },
            }).then((r) => r.json())
        )
    );

    const albums = detailsArrays.flatMap((d) => d.albums ?? []).filter(Boolean);

    return albums
        .map((album: any) => ({ album, popularity: album.popularity ?? 0 }))
        .filter((item: AlbumWithPopularity) => item.popularity >= minPopularity)
        .sort((a, b) => b.popularity - a.popularity);
}

async function fetchNewReleases(token: string): Promise<AlbumWithPopularity[]> {
    const res = await fetch(
        "https://api.spotify.com/v1/browse/new-releases?limit=20&market=US",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                revalidate: 86400,
            },
        }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const items = (data.albums?.items ?? []).filter(
        (a: any) => a?.album_type === "album"
    );

    return items.map((album: any) => ({
        album,
        popularity: album.popularity ?? 0,
    }));
}

/**
 * Spotify client-credentials albums for marketing / home preview.
 * Tries year search with tightening filters, then browse new-releases so the section
 * usually has rows even when "recent + popular" search is sparse.
 */
export default async function getTopAlbums(): Promise<AlbumWithPopularity[]> {
    const token = await getAccessToken();

    if (!token) {
        console.error("Unable to retrieve Spotify access token");
        return [];
    }

    try {
        const fetchedAlbums = await searchAlbumsByYear(token);
        const now = new Date();

        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const oneEightyDaysAgo = new Date(now);
        oneEightyDaysAgo.setDate(oneEightyDaysAgo.getDate() - 180);

        let ranked = await fetchAlbumDetailsAndRank(
            token,
            fetchedAlbums,
            50,
            sixtyDaysAgo
        );
        if (ranked.length > 0) return ranked;

        ranked = await fetchAlbumDetailsAndRank(
            token,
            fetchedAlbums,
            35,
            oneEightyDaysAgo
        );
        if (ranked.length > 0) return ranked;

        ranked = await fetchAlbumDetailsAndRank(token, fetchedAlbums, 25, null);
        if (ranked.length > 0) return ranked;

        const fromNew = await fetchNewReleases(token);
        return fromNew;
    } catch (err) {
        console.error("Error fetching top albums: ", err);
        return [];
    }
}
