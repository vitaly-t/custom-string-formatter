import {sanitizeFilterArg} from '../src';
import {decodeSymbols} from '../src/encoding';

describe('sanitizeFilterArg', () => {
    const allSymbols = 'Test-:|{}<>()';
    it('must convert into decimals', () => {
        expect(sanitizeFilterArg(allSymbols)).toEqual('Test-&#58;&#124;&#123;&#125;&#60;&#62;&#40;&#41;');
    });
    it('must convert into hex', () => {
        expect(sanitizeFilterArg(allSymbols, 'hex')).toEqual('Test-&#x3a;&#x7c;&#x7b;&#x7d;&#x3c;&#x3e;&#x28;&#x29;');
    });
    it('must convert into hex-cap', () => {
        expect(sanitizeFilterArg(allSymbols, 'hex-cap')).toEqual('Test-&#x3A;&#x7C;&#x7B;&#x7D;&#x3C;&#x3E;&#x28;&#x29;');
    });
});

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
