let releaseDateInfo: string[] = [];
let releaseMonth: string | null = null;

function getReleaseMonthName(numericalMonth: string): any {

    switch (Number(numericalMonth)) {
        case 1:
            return 'January';
        case 2:
            return 'February';
        case 3:
            return 'March';
        case 4:
            return 'April';
        case 5:
            return 'May';
        case 6:
            return 'June';
        case 7:
            return 'July';
        case 8:
            return 'August';
        case 9:
            return 'September';
        case 10:
            return 'October';
        case 11:
            return 'November';
        case 12:
            return 'December';
    }

}

export default function getReleaseDate(releaseDate?: string) {

    if (!releaseDate || typeof releaseDate !== 'string') {
        return { releaseDateInfo: [], releaseMonth: null };
    }

    releaseDateInfo = releaseDate.split('-', 3);
    releaseMonth = getReleaseMonthName(releaseDateInfo[1]);

    return { releaseDateInfo, releaseMonth };
    
}