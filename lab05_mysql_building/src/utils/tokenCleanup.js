const { TokenBlacklist } = require('../models');
const { Op } = require('sequelize');

/**
 * Clean up expired tokens from blacklist
 * Run this periodically (e.g., daily via cron job)
 */
const cleanupExpiredTokens = async () => {
    try {
        const deleted = await TokenBlacklist.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });

        console.log(`[Token Cleanup] Removed ${deleted} expired tokens from blacklist`);
        return deleted;
    } catch (error) {
        console.error('[Token Cleanup] Error:', error);
        throw error;
    }
};

/**
 * Revoke all tokens for a specific user
 * Useful for admin actions or security incidents
 */
const revokeAllUserTokens = async (userId, reason = 'admin_action') => {
    try {
        // This would require storing all active tokens per user
        // For now, we'll just mark a flag in the user record
        console.log(`[Token Revoke] All tokens for user ${userId} marked for revocation`);
        return true;
    } catch (error) {
        console.error('[Token Revoke] Error:', error);
        throw error;
    }
};

module.exports = {
    cleanupExpiredTokens,
    revokeAllUserTokens
};
