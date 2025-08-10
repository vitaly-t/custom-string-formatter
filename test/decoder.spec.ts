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
    it('confirms symbols required to encode', () => {
        expect(decodeSymbols(['&#124;', '&#x7c;'])).toEqual(['|', '|']);
        expect(decodeSymbols(['&#58;', '&#x3a;'])).toEqual([':', ':']);
        expect(decodeSymbols(['&#40;', '&#x28;'])).toEqual(['(', '(']);
        expect(decodeSymbols(['&#41;', '&#x29;'])).toEqual([')', ')']);
        expect(decodeSymbols(['&#123;', '&#x7b;'])).toEqual(['{', '{']);
        expect(decodeSymbols(['&#125;', '&#x7d;'])).toEqual(['}', '}']);
        expect(decodeSymbols(['&#60;', '&#x3c;'])).toEqual(['<', '<']);
        expect(decodeSymbols(['&#62;', '&#x3e;'])).toEqual(['>', '>']);
    });
});
