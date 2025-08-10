const decodeRegEx = /&#(\d{1,6});|&#x([\da-f]{1,5});/gi;

/**
 * Helper for decoding HTML-encoded symbols inside a list of strings.
 *
 * @param items
 * List of strings that may contain symbols encoded like this:
 *  - `&#123;`: decimal symbol code (1-6 digits);
 *  - `&#x1a3;`: hexadecimal symbol code (1-5 hex digits, case-insensitive);
 *
 * @example
 *  - `&#94;` => `^`
 *  - `&#x20ac;` => `€`
 *  - `&#x1f60a;` => `😊`
 */
export function decodeSymbols(items: string[]): string[] {
    return items.map(a => a.replace(decodeRegEx, (...m: string[]) => {
        const code = m[1] ? parseInt(m[1], 10) : parseInt(m[2], 16);
        return String.fromCodePoint(code);
    }));
}
