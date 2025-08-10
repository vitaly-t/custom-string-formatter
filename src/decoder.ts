const decodeRegEx = /\\x([\da-f]{1,5})/gi;

/**
 * Helper for decoding hex-encoded sequences inside a list of strings.
 *
 * @param items
 * List of strings that may have encoded sequences in the form of `\xCODE`,
 * where the `CODE` is 1-5 hex digits (case-insensitive).
 *
 * @example
 *  - `\x5e` => `^`
 *  - `\x20ac` => `€`
 *  - `\x1f60a` => `😊`
 */
export function decodeSymbols(items: string[]): string[] {
    return items.map(a => a.replace(decodeRegEx, (...m: string[]) => {
        return String.fromCodePoint(parseInt(m[1], 16));
    }));
}
