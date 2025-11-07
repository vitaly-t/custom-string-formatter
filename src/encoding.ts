/**
 * Sanitizes text for one or more filter arguments by replacing symbols `:|{}()<>`
 * with their corresponding HTML-encoded strings (hexadecimal).
 *
 * @param args
 * Filter argument(s) text to be sanitized.
 *
 * @returns
 * Sanitized string that's safe to use as a filter argument.
 * When more than one argument is provided, they are joined with `:`.
 *
 * @example
 * import {sanitizeFilterArgs} from 'custom-string-formatter';
 *
 * sanitizeFilterArgs('some (text)'); //=> some &#x28;text&#x29;
 *
 * @see {@link decodeFilterArg}
 */
export function sanitizeFilterArgs(...args: string[]): string {
    return args.map(a => a.replace(/[:|(){}<>]/g, m => {
        const code = m.charCodeAt(0).toString(16);
        return `&#x${code};`;
    })).join(':');
}

/**
 * Helper for decoding HTML-encoded symbols inside a string.
 *
 * This is almost a generic decoder for HTML-encoded symbols,
 * supporting decimal and hexadecimal codes, plus optional removal
 * of accents (diacritical marks) from letters. However, it does not
 * support HTML entity names, like `&amp;`, etc., as its main purpose
 * is to decode filter arguments (not full HTML documents), so it
 * prioritizes performance over universality.
 *
 * @param arg
 * A string that contains HTML-encoded symbols, like this:
 *  - `&#123;` - decimal symbol code (1-6 digits);
 *  - `&#x1a3;` - hexadecimal symbol code (1-5 hex digits, case-insensitive);
 *
 * @param removeAccents
 * Optional accents (diacritical marks) removal from letters, if truthy.
 * Default is `false`.
 *
 * @returns
 * Decoded string.
 *
 * @example
 * import {decodeFilterArg} from 'custom-string-formatter';
 *
 * decodeFilterArg('some &#x28;text&#x29;'); //=> some (text)
 *
 * decodeFilterArg('sòmê &#60;téxt&#62;'); //=> sòmê <téxt>
 *
 * decodeFilterArg('sòmê &#60;téxt&#62;', true); //=> some <text>
 *
 * @see {@link sanitizeFilterArgs}
 */
export function decodeFilterArg(arg: string, removeAccents = false): string {
    if (removeAccents) {
        arg = arg.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return arg.replace(/&#(\d{1,6});|&#x([\da-f]{1,5});/gi, (...m: string[]) => {
        const code = m[1] ? parseInt(m[1], 10) : parseInt(m[2], 16);
        return String.fromCodePoint(code);
    });
}
