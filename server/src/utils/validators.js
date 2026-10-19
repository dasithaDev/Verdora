/**
 * Shared validation patterns used across controllers and Mongoose schemas.
 * Centralising these prevents silent divergence when requirements change.
 */

/**
 * Basic email format check: must have something@something.something
 * Matches the same pattern used in the User Mongoose schema.
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
