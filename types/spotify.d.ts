export type SpotifyAlbums = {
    id: string;
    name: string;
    release_date: string;
    album_type: string;
    artists: {
        name: string;
        id: string
    }[];
    images: {
        url: string;
        height: number;
        width: number;
    }[];
};

export type SpotifyAlbumsResponse = {
    albums: {
        href: string;
        items: SpotifyAlbums[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
};

export type SpotifyAlbum = {
    artists: {
        name: string,
    }[],
    id: string,
    images: {
        url: string,
    }[],
    name: string,
    release_date: string,
    total_tracks: number,
    tracks: {
        items: {
            artists: {
                name: string,
            }[],
            name: string,
            track_number: number
        }[],
    }
}

export type AlbumType = {
    title: string,
    artist: string,
    id: string,
    images: string
}

export interface AlbumPageParams {
    params: {
        id: string;
    }
}

export interface AlbumInfo {
    id: string;
    title: string;
    artists: {
        name: string;
        artistId: string;
    }[];
    images: {
        url: string;
    }[]
    releaseDate: string;
    totalTracks: number;
    trackList: {
        items: {
        }[]
    }[];
}