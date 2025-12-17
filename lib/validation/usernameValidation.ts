/**
 * Validates a username according to the rules:
 * - Only lowercase letters (a-z)
 * - Numbers 0-9
 * - Period (.) and underscore (_)
 * - Cannot start with . or _
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length === 0) {
        return { valid: false, error: 'Username is required' };
    }

    // Check if username starts with . or _
    if (username[0] === '.' || username[0] === '_') {
        return { valid: false, error: 'Username cannot start with a period or underscore' };
    }

    // Check if username contains only allowed characters
    const usernameRegex = /^[a-z0-9._]+$/;
    if (!usernameRegex.test(username)) {
        return { 
            valid: false, 
            error: 'Username can only contain lowercase letters, numbers, periods, and underscores' 
        };
    }

    return { valid: true };
}

/**
 * Sanitizes username input by converting to lowercase and removing invalid characters
 * This is used for real-time input filtering
 */
export function sanitizeUsernameInput(input: string): string {
    // Convert to lowercase
    let sanitized = input.toLowerCase();
    
    // Remove any characters that aren't allowed
    sanitized = sanitized.replace(/[^a-z0-9._]/g, '');
    
    // Remove leading . and _ characters (can have multiple)
    sanitized = sanitized.replace(/^[._]+/, '');
    
    return sanitized;
}

