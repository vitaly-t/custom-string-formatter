import {decodeSymbols} from '../src/decoder';

describe('decodeSymbols', () => {
    it('must handle ASCII symbols', () => {
        expect(decodeSymbols(['\\x5E', '\\x7B'])).toEqual(['^', '{']);
        expect(decodeSymbols(['\\x5e', '\\x7b'])).toEqual(['^', '{']);
    });
    it('must handle short Unicode symbols', () => {
        // Symbols: Euro + Sigma + Infinity:
        expect(decodeSymbols(['\\x20AC', '\\x3A3', '\\x221E'])).toEqual(['€', 'Σ', '∞']);
        expect(decodeSymbols(['\\x20ac', '\\x3a3', '\\x221e'])).toEqual(['€', 'Σ', '∞']);
    });
    it('must handle long Unicode symbols', () => {
        expect(decodeSymbols(['\\x1F60A', '\\x1F451'])).toEqual(['😊', '👑']);
        expect(decodeSymbols(['\\x1F60a', '\\x1f451'])).toEqual(['😊', '👑']);
    });
});
