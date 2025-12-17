'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";

type ActivityFeedItemProps = {
    username: string;
    activityType: 'reviewed' | 'rated' | 'liked' | 'favorited' | 'queued';
    rating: number | null;
    albumTitle: string | null;
    albumCover: string | null;
    albumSpotifyId: string | null;
    albumId: string;
    userAlbumId?: string; // The UUID of the user_albums row (for review links)
    createdAt: string;
}

export default function ActivityFeedItem({
    username,
    activityType,
    rating,
    albumTitle,
    albumCover,
    albumSpotifyId,
    albumId,
    userAlbumId,
    createdAt
}: ActivityFeedItemProps) {
    const router = useRouter();

    const activityText = {
        'reviewed': 'reviewed',
        'rated': 'rated',
        'liked': 'liked',
        'favorited': 'favorited',
        'queued': 'added to queue'
    }[activityType] || 'interacted with';

    // Determine the link based on activity type
    let activityLink: string;
    if (activityType === 'reviewed' && userAlbumId) {
        // Navigate to the review page using the user_albums UUID
        activityLink = `/profile/${username}/review/${userAlbumId}`;
    } else if (activityType === 'queued') {
        // Navigate to the user's albums page with queue view parameter
        activityLink = `/profile/${username}/albums?view=queue`;
    } else {
        // For rated, liked, favorited - navigate to the album page
        activityLink = `/album/${albumSpotifyId || albumId}`;
    }

    const profileLink = `/profile/${username}`;

    // Format time ago
    const timeAgo = (() => {
        const now = new Date();
        const activityDate = new Date(createdAt);
        const diffMs = now.getTime() - activityDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return activityDate.toLocaleDateString();
    })();

    const handleUsernameClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(profileLink);
    };

    return (
        <div
            onClick={() => router.push(activityLink)}
            className={`
                group
                relative
                cursor-pointer
                w-full
                p-6
                bg-secondaryBackground
                rounded-2xl
                border border-primaryBorder/30
                hover:border-primaryBorder/50
                transition-all duration-300 ease-out
                hover:bg-tertiaryBackground
            `}
        >
            <div className="flex items-center gap-4">
                {/* Album Cover */}
                {albumCover && (
                    <div className="relative flex-shrink-0">
                        <img 
                            src={albumCover} 
                            alt={albumTitle || 'Album cover'}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 object-cover"
                        />
                    </div>
                )}
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <button
                            onClick={handleUsernameClick}
                            className="text-secondaryText hover:text-accentText transition-colors text-left"
                        >
                            @{username}
                        </button>
                        <span className="text-secondaryText">
                            {activityText}
                        </span>
                        {rating !== null && (
                            <div className="flex items-center gap-1">
                                <span className="text-accentText font-medium">{rating}</span>
                                <span className="text-secondaryText text-sm">★</span>
                            </div>
                        )}
                    </div>
                    {albumTitle && (
                        <h3 className="text-xl font-semibold text-primaryText mb-1 group-hover:text-accentText transition-colors line-clamp-1">
                            {albumTitle}
                        </h3>
                    )}
                    <p className="text-sm text-secondaryText">
                        {timeAgo}
                    </p>
                </div>

                {/* Activity Type Icon */}
                <div className="flex-shrink-0">
                    {activityType === 'reviewed' && (
                        <div className="w-10 h-10 rounded-full bg-accentText/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-accentText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                    )}
                    {activityType === 'rated' && (
                        <div className="w-10 h-10 rounded-full bg-accentText/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-accentText" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                    )}
                    {activityType === 'favorited' && (
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {activityType === 'liked' && (
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {activityType === 'queued' && (
                        <div className="w-10 h-10 rounded-full bg-accentText/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-accentText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
