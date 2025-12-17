'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import type { Notification } from '@/lib/supabase/getNotifications';

type NotificationButtonProps = {
    userId: string | null;
    currentUsername?: string | null; // Username of the current user (review owner)
}

export default function NotificationButton({ userId, currentUsername }: NotificationButtonProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!userId) return;

        // Fetch notifications
        const fetchNotifications = async () => {
            if (!userId) return;
            
            try {
                const response = await fetch('/api/notifications');
                if (response.ok) {
                    const data = await response.json();
                    // Merge with existing notifications to preserve local read state
                    setNotifications(prev => {
                        // Create a map of existing notifications to preserve local read state
                        const existingMap = new Map(prev.map(n => [n.id, n]));
                        
                        // Process new notifications from API
                        const processedData = data
                            .map((n: Notification) => {
                                const existing = existingMap.get(n.id);
                                // If notification is marked as read locally, keep it as read
                                if (readNotificationIds.has(n.id)) {
                                    return { ...n, read: true };
                                }
                                // If notification exists locally and was marked as read, preserve that
                                if (existing && existing.read) {
                                    return { ...n, read: true };
                                }
                                return n;
                            })
                            // Filter out notifications that are read in database (unless they're in local read set)
                            .filter((n: Notification) => {
                                // Keep if: not read, or read locally (in readNotificationIds)
                                return !n.read || readNotificationIds.has(n.id);
                            });
                        
                        // Keep existing notifications that are marked as read locally (even if not in new data)
                        // This ensures they don't disappear when polling refreshes while modal is open
                        const localReadNotifications = prev.filter(n => 
                            readNotificationIds.has(n.id) && !data.find((d: Notification) => d.id === n.id)
                        );
                        
                        // Combine: new notifications + locally read notifications (only if modal is open)
                        const combined = isOpen 
                            ? [...processedData, ...localReadNotifications]
                            : processedData; // If modal is closed, don't keep locally read ones
                        
                        // Update unread count
                        const unread = combined.filter((n: Notification) => 
                            !n.read && !readNotificationIds.has(n.id)
                        );
                        setUnreadCount(unread.length);
                        
                        return combined;
                    });
                } else {
                    console.error('Error fetching notifications:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();

        // Set up polling for new notifications (every 10 seconds)
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [userId, supabase, readNotificationIds, isOpen]);

    // When modal closes, mark all viewed notifications as read and remove them from the list
    useEffect(() => {
        if (!isOpen && readNotificationIds.size > 0) {
            // Mark all viewed notifications as read in the database
            const markAsRead = async () => {
                const notificationIds = Array.from(readNotificationIds);
                try {
                    await fetch('/api/notifications', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notificationIds }),
                    });
                } catch (error) {
                    console.error('Error marking notifications as read:', error);
                }
            };
            markAsRead();
            
            // Remove read notifications from the list
            setNotifications(prev => prev.filter(n => !readNotificationIds.has(n.id)));
            setReadNotificationIds(new Set());
        }
    }, [isOpen, readNotificationIds]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'follow':
                return `@${notification.username} started following you`;
            case 'like':
                return `@${notification.username} liked your review`;
            case 'comment':
                return `@${notification.username} commented on your review`;
            default:
                return '';
        }
    };

    const getNotificationLink = (notification: Notification) => {
        if (notification.type === 'follow') {
            return `/profile/${notification.username}`;
        }
        // For likes and comments on reviews, navigate to the review page
        if (notification.type === 'like' || notification.type === 'comment') {
            // Use review_owner_username if available, otherwise fall back to currentUsername
            const ownerUsername = notification.review_owner_username || currentUsername;
            if (notification.review_id && ownerUsername) {
                return `/profile/${ownerUsername}/review/${notification.review_id}`;
            }
        }
        return '#';
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative
                    p-2
                    rounded-lg
                    hover:bg-secondaryBackground
                    transition-colors
                    cursor-pointer
                    md:px-3 md:py-2
                `}
            >
                {unreadCount > 0 ? (
                    <BellIconSolid className={`
                        w-5 h-5
                        text-accentText
                        md:w-4 md:h-4
                    `} />
                ) : (
                    <BellIcon className={`
                        w-5 h-5
                        text-secondaryText
                        hover:text-accentText
                        transition-colors
                        md:w-4 md:h-4
                    `} />
                )}
                {unreadCount > 0 && (
                    <span className={`
                        absolute
                        top-1 right-1
                        w-2 h-2
                        bg-accentText
                        rounded-full
                    `} />
                )}
            </button>

            {isOpen && (
                <div className={`
                    absolute
                    right-0
                    top-full
                    mt-2
                    w-80
                    max-h-96
                    overflow-y-auto
                    bg-secondaryBackground
                    rounded-lg
                    shadow-lg
                    border border-primaryBorder
                    z-50
                `}>
                    <div className={`
                        p-4
                        border-b border-primaryBorder
                        flex justify-between items-center
                    `}>
                        <h3 className="text-lg font-semibold text-primaryText">
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <>
                                    <button
                                        onClick={async () => {
                                            const unreadIds = notifications
                                                .filter(n => !n.read && !readNotificationIds.has(n.id))
                                                .map(n => n.id);
                                            
                                            if (unreadIds.length === 0) return;

                                            // Add all to read set
                                            setReadNotificationIds(prev => {
                                                const newSet = new Set(prev);
                                                unreadIds.forEach(id => newSet.add(id));
                                                return newSet;
                                            });
                                            
                                            // Update local state immediately - mark as read (but keep in list)
                                            setNotifications(prev => 
                                                prev.map(n => 
                                                    unreadIds.includes(n.id) ? { ...n, read: true } : n
                                                )
                                            );
                                            setUnreadCount(0);
                                            
                                            // Note: Database persistence happens when modal closes
                                        }}
                                        className={`
                                            text-xs
                                            text-accentText
                                            hover:text-primaryText
                                            transition-colors
                                            whitespace-nowrap
                                        `}
                                    >
                                        Mark all as read
                                    </button>
                                    <span className={`
                                        text-xs
                                        text-accentText
                                        bg-accentText/20
                                        px-2 py-1
                                        rounded-full
                                    `}>
                                        {unreadCount > 99 ? '99+' : unreadCount} new
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-secondaryText">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-secondaryText">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y divide-primaryBorder">
                            {notifications.map((notification) => {
                                const isRead = notification.read || readNotificationIds.has(notification.id);
                                
                                return (
                                <Link
                                    key={notification.id}
                                    href={getNotificationLink(notification)}
                                    onClick={() => setIsOpen(false)}
                                    onMouseEnter={() => {
                                        // Mark as read on hover if not already read (just visual, don't delete yet)
                                        if (!isRead) {
                                            setReadNotificationIds(prev => new Set(prev).add(notification.id));
                                            // Update the notification to show as read (but keep in list)
                                            setNotifications(prev => 
                                                prev.map(n => 
                                                    n.id === notification.id ? { ...n, read: true } : n
                                                )
                                            );
                                            setUnreadCount(prev => Math.max(0, prev - 1));
                                        }
                                    }}
                                    className={`
                                        block
                                        p-4
                                        hover:bg-primaryBackground
                                        transition-colors
                                        ${!isRead ? 'bg-primaryBackground/50' : ''}
                                    `}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            {notification.avatar_url ? (
                                                <img
                                                    src={notification.avatar_url}
                                                    alt={notification.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-tertiaryBackground flex items-center justify-center">
                                                    <span className="text-secondaryText text-sm">
                                                        {notification.username[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`
                                                text-sm
                                                ${!isRead ? 'text-primaryText font-medium' : 'text-secondaryText'}
                                            `}>
                                                {getNotificationText(notification)}
                                            </p>
                                            {notification.type === 'comment' && notification.comment_text && (
                                                <p className="text-xs text-secondaryText mt-1 line-clamp-2">
                                                    {notification.comment_text}
                                                </p>
                                            )}
                                            {notification.album_title && (
                                                <p className="text-xs text-secondaryText mt-1">
                                                    {notification.album_title}
                                                </p>
                                            )}
                                            <p className="text-xs text-secondaryText mt-1">
                                                {formatTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-accentText rounded-full mt-2" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

