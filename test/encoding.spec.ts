import {sanitizeFilterArg, decodeFilterArg} from '../src';

describe('sanitizeFilterArg', () => {
    it('must convert into hex', () => {
        const allSymbols = 'Test-:|{}<>()';
        expect(sanitizeFilterArg(allSymbols)).toEqual('Test-&#x3a;&#x7c;&#x7b;&#x7d;&#x3c;&#x3e;&#x28;&#x29;');
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
