import { search } from 'fast-fuzzy';

interface SearchResults {
    albums: {
        [key: string]: any,
    },
    artists: {
        href: string,
        items: {
            external_urls: {
                spotify: string,
            },
            followers: {
                href: any,
                total: number
            },
            genres: [],
            href: string,
            id: string,
            images: {
                url: string,
                height: number,
                width: number
            }[],
            name: string,
            popularity: number,
            uri: string
        }[],
        limit: number,
        next: string,
        offset: number,
        previous: any,
        total: number
    },
}

interface Albums {
    name: string,
    artists: {
        name: string,
        [key: string]: any,
    }[],
    [key: string]: any,
}[]

interface Artists {
    name: string,
    [key: string]: any,
}[]

interface SortedResults {
}[]


export default function arrangeSearch(sk: string, sr: SearchResults) {
    const keyword: string = sk;
    const searchResults: SearchResults = sr;

    try {
        const albums: Albums = searchResults.albums.items.filter((item: any) => item.album_type.includes('album'));

        if (!albums) {
            throw new Error ('No Albums Found')
        }

        try {    
            const artist = search(keyword, searchResults.artists.items, {keySelector: (item: {name: string}) => item.name, returnMatchData: true})

            if (!artist) {
                return {albums}
            }

            if (!artist[0].score) {
                return {albums, artist}
            }

            if (artist[0].score) {
                const artistMatchScore: number = artist[0].score;
                return {albums, artist, artistMatchScore}
            }

        } catch (error) {

            console.error('Error finding artists: ', error)
            return {albums}

        }
    } catch (error) {

        console.error('Error sorting results')
        
    }
}