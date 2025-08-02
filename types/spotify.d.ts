export type SpotifyAlbums = {
    id: string;
    name: string;
    release_date: string;
    album_type: string;
    artists: {
        name: string;
        id: string;
    }[];
    images: {
        url: string;
        height: number;
        width: number;
    }[];
    popularity: number;
};

export type SpotifyAlbumsResponse = {
    album_type: string,
    total_tracks: number,
    is_playable: boolean,
    external_urls: {
        spotify: string,
    }[],
    href: string,
    id: string,
    images: {

    }[],
    name: string,
    release_date: string,
    release_date_precision: string,
    uri: string,
    artists: {
        
    }[]
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

export type AlbumPageInfoProps = {
    tracks: {
        artists: any
    }[],
    totalTracks: number,
}

export interface SearchPageParams {
    params: {
        query: string;
    }
}

export interface ReviewPageParams {
    params: {
        sortMethod: string
    }
}