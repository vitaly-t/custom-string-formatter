/**
 * Argument encoding type, as used by {@link sanitizeFilterArg}
 */
export type ArgumentEncoding = 'decimal' | 'hex' | 'hex-cap';

/**
 * Sanitizes a filter-argument text by replacing symbols `:|{}()<>`
 * with their corresponding HTML-encoded strings.
 *
 * @param arg
 * Filter argument text to be sanitized.
 *
 * @param encoding
 * How to HTML-encode the replacement strings:
 *  - `decimal` (default): Produce Decimal HTML encodings
 *  - `hex`: Produce Hexadecimal HTML encodings
 *  - `hex-cap`: Produce Hexadecimal HTML encodings, capitalized
 *
 * @returns
 * Sanitized string.
 */
export function sanitizeFilterArg(arg: string, encoding: ArgumentEncoding = 'decimal'): string {
    return arg.replace(/:|\||\(|\)|{|}|<|>/g, m => {
        const code = m.charCodeAt(0).toString(encoding === 'decimal' ? 10 : 16);
        switch (encoding) {
            case 'hex':
                return `&#x${code};`;
            case 'hex-cap':
                return `&#x${code.toUpperCase()};`;
            default:
                return `&#${code};`;
        }
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
