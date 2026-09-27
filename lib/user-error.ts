/**
 * An error whose message is written for end users and is safe to return in
 * an API response. Anything else (database, network, library errors) can
 * carry internal details such as query text, so API routes only ever pass
 * this class's message through and replace everything else with a generic one.
 */
export class UserFacingError extends Error {}
