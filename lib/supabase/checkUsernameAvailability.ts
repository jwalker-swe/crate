import { createClient } from "./server";

/**
 * Checks if a username is available (not already taken)
 * @param username - The username to check
 * @param excludeUserId - Optional user ID to exclude from the check (useful when editing own profile)
 * @returns true if username is available, false if it's taken
 */
export default async function checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    const supabase = await createClient();

    try {
        let query = supabase
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .limit(1);

        // If editing, exclude the current user's ID
        if (excludeUserId) {
            query = query.neq('id', excludeUserId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error checking username availability:', error);
            // On error, assume unavailable to be safe
            return false;
        }

        // If data exists, username is taken
        return !data || data.length === 0;
    } catch (error) {
        console.error('Unexpected error checking username availability:', error);
        return false;
    }
}

