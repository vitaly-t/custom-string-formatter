/**
 * Sanitizes a filter-argument text by replacing symbols `:|{}()<>`
 * with their corresponding HTML-encoded strings (hexadecimal).
 *
 * @param arg
 * Filter argument text to be sanitized.
 *
 * @returns
 * Sanitized string that's safe to use as a filter argument.
 */
export function sanitizeFilterArg(arg: string): string {
    return arg.replace(/:|\||\(|\)|{|}|<|>/g, m => {
        const code = m.charCodeAt(0).toString(16);
        return `&#x${code};`;
    });
}

/**
 * Helper for decoding HTML-encoded symbols inside a string.
 *
 * @param arg
 * A string that contains HTML-encoded symbols, like this:
 *  - `&#123;`: decimal symbol code (1-6 digits);
 *  - `&#x1a3;`: hexadecimal symbol code (1-5 hex digits, case-insensitive);
 *
 * @returns
 * Decoded string.
 */
export function decodeFilterArg(arg: string): string {
    return arg.replace(/&#(\d{1,6});|&#x([\da-f]{1,5});/gi, (...m: string[]) => {
        const code = m[1] ? parseInt(m[1], 10) : parseInt(m[2], 16);
        return String.fromCodePoint(code);
    });
}
