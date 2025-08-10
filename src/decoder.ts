const decodeRegEx = /\\x([\da-f]{1,2})|\\u([\da-f]{1,4})|\\u{([\da-f]{1,5})}/gi;

/**
 * Helper for decoding special-encoded sequences inside a list of strings.
 *
 * @param items
 * List of strings that may have encoded sequences like these:
 *  - `\x5E` (letter `^`): ASCII-encoded symbols, using 1-2 hex digits
 *  - `\u20AC` (letter `€`): Unicode symbols, using 1-4 hex digits
 *  - `\u{1F60A}` (smiley `😊`): Unicode symbols, using 1-5 hex digits
 *
 *  Hex codes and not case-sensitive.
 */
export function decodeSymbols(items: string[]): string[] {
    return items.map(a => a.replace(decodeRegEx, (...m: string[]) => {
        if (m[1]) {
            return String.fromCharCode(parseInt(m[1], 16));
        }
        return String.fromCodePoint(parseInt(m[2] || m[3], 16));
    }));
}
