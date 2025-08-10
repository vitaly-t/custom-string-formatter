import {decodeSymbols} from '../src/decoder';

describe('decodeSymbols', () => {
    it('must handle ASCII symbols', () => {
        expect(decodeSymbols(['\\x5E', '\\x7B'])).toEqual(['^', '{']);
        expect(decodeSymbols(['\\x5e', '\\x7b'])).toEqual(['^', '{']);
    });
    it('must handle short Unicode symbols', () => {
        // Symbols: Euro + Sigma + Infinity:
        expect(decodeSymbols(['\\u20AC', '\\u3A3', '\\u221E'])).toEqual(['€', 'Σ', '∞']);
        expect(decodeSymbols(['\\u20ac', '\\u3a3', '\\u221e'])).toEqual(['€', 'Σ', '∞']);
    });
    it('must handle long Unicode symbols', () => {
        expect(decodeSymbols(['\\u{1F60A}', '\\u{1F451}'])).toEqual(['😊', '👑']);
        expect(decodeSymbols(['\\u{1F60a}', '\\u{1f451}'])).toEqual(['😊', '👑']);
    });
});
