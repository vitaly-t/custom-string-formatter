import {decodeSymbols} from '../src/decoder';

describe('decodeSymbols', () => {
    it('must handle ASCII symbols', () => {
        expect(decodeSymbols(['&#94;', '&#123;'])).toEqual(['^', '{']);
        expect(decodeSymbols(['&#x5E;', '&#x7b;'])).toEqual(['^', '{']);
    });
    it('must handle short Unicode symbols', () => {
        // Symbols: Euro + Sigma + Infinity:
        expect(decodeSymbols(['&#8364;', '&#931;', '&#8734;'])).toEqual(['€', 'Σ', '∞']);
        expect(decodeSymbols(['&#x20AC;', '&#x3a3;', '&#x221e;'])).toEqual(['€', 'Σ', '∞']);
    });
    it('must handle long Unicode symbols', () => {
        expect(decodeSymbols(['&#128522;', '&#128081;'])).toEqual(['😊', '👑']);
        expect(decodeSymbols(['&#x1F60a;', '&#x1f451;'])).toEqual(['😊', '👑']);
    });
});
