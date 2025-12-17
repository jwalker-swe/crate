import { createClient } from "./server";

export default async function markNotificationsRead(userId: string, notificationIds: string[]) {
    if (!userId || notificationIds.length === 0) {
        return { success: false, error: 'Invalid parameters' };
    }

    const supabase = await createClient();

    try {
        // Insert or update read status for each notification
        // We'll use a simple approach: store in a notification_reads table
        // Format: { user_id, notification_id, read_at }
        
        const reads = notificationIds.map(notificationId => ({
            user_id: userId,
            notification_id: notificationId,
            read_at: new Date().toISOString()
        }));

        // Use upsert to handle duplicates
        // Note: If the table doesn't exist, you'll need to create it with:
        // CREATE TABLE notification_reads (
        //   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        //   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        //   notification_id TEXT NOT NULL,
        //   read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        //   UNIQUE(user_id, notification_id)
        // );
        const { error } = await supabase
            .from('notification_reads')
            .upsert(reads, { 
                onConflict: 'user_id,notification_id',
                ignoreDuplicates: false 
            });

        if (error) {
            // If table doesn't exist, we'll handle it gracefully
            if (error.code === '42P01') {
                console.warn('notification_reads table does not exist. Please create it in your database.');
                // For now, we'll just return success since we can't store read status
                // In production, you should create the table
                return { success: true, warning: 'Table does not exist' };
            }
            console.error('Error marking notifications as read:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in markNotificationsRead:', error);
        return { success: false, error: 'Unknown error' };
    }
}

