



export default function SearchDataForCurrentUser(currentUserId: string, dataSet: any) {

    if (dataSet.length === 0) {
        const count = 0;
        const liked = false;
        
        return {liked, count};
    } else {
        const count = dataSet.length;

        const ids = dataSet.map((item: any) => {
            return item.user_id;
        })

        const liked = ids.includes(currentUserId);

        return {liked, count};
    }

}