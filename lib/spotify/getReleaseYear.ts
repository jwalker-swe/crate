let releaseYear: string[] = [];

export default function getReleaseYear(releaseDate: string) {

    releaseYear = releaseDate.split('-', 1);

    return releaseYear
}