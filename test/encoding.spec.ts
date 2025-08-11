import {sanitizeFilterArg, decodeFilterArg} from '../src';

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

describe('decodeFilterArg', () => {
    it('must handle ASCII symbols', () => {
        expect(decodeFilterArg('&#94;')).toEqual('^');
        expect(decodeFilterArg('&#123;')).toEqual('{');
        expect(decodeFilterArg('&#x5E;')).toEqual('^');
        expect(decodeFilterArg('&#x7b;')).toEqual('{');
    });
    it('must handle short Unicode symbols', () => {
        expect(decodeFilterArg('&#8364;')).toEqual('€');
        expect(decodeFilterArg('&#x3a3;')).toEqual('Σ');
    });
    it('must handle long Unicode symbols', () => {
        expect(decodeFilterArg('&#128522;')).toEqual('😊');
        expect(decodeFilterArg('&#128081;')).toEqual('👑');
        expect(decodeFilterArg('&#x1F60a;')).toEqual('😊');
        expect(decodeFilterArg('&#x1f451;')).toEqual('👑');
    });
    it('confirms symbols required to encode', () => {
        expect(decodeFilterArg('&#124;')).toEqual('|');
        expect(decodeFilterArg('&#58;')).toEqual(':');
        expect(decodeFilterArg('&#40;')).toEqual('(');
        expect(decodeFilterArg('&#41;')).toEqual(')');
        expect(decodeFilterArg('&#123;')).toEqual('{');
        expect(decodeFilterArg('&#125;')).toEqual('}');
        expect(decodeFilterArg('&#60;')).toEqual('<');
        expect(decodeFilterArg('&#62;')).toEqual('>');
    });
});
