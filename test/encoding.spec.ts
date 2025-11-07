import {sanitizeFilterArgs, decodeFilterArg} from '../src';

describe('sanitizeFilterArgs', () => {
    it('must convert into hex', () => {
        const input = 'Test-:|{}<>()';
        expect(sanitizeFilterArgs(input)).toEqual('Test-&#x3a;&#x7c;&#x7b;&#x7d;&#x3c;&#x3e;&#x28;&#x29;');
    });
    it('must handle multiple strings', () => {
        expect(sanitizeFilterArgs('(a)', ':b:', '|c|')).toEqual('&#x28;a&#x29;:&#x3a;b&#x3a;:&#x7c;c&#x7c;');
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
    describe('with accents in text ', () => {
        it('must be kept by default', () => {
            expect(decodeFilterArg('sòmê &#60;téxt&#62;')).toEqual('sòmê <téxt>');
        });
        it('must be removed when flag is set', () => {
            expect(decodeFilterArg('sòmê &#60;téxt&#62;', true)).toEqual('some <text>');
        });
    });
});
