import {resolveProperty} from '../src/resolver';

describe('resolveProperty', () => {
    it('must resolve "this"', () => {
        const obj = {prop: 123};
        expect(resolveProperty('this', obj)).toStrictEqual({exists: true, value: obj});
        expect(resolveProperty('this.prop', obj)).toStrictEqual({exists: true, value: obj.prop});
    });
    it('must resolve deep properties', () => {
        const obj = {a: {b: {c: {d: 123}}}};
        expect(resolveProperty('a.b.c.d', obj)).toEqual({exists: true, value: 123});
    });
    it('it must handle missing properties', () => {
        const obj = {a: {b: null}};
        expect(resolveProperty('a.b.c', obj)).toEqual({exists: false});
    });
    it('it must handle a no-properties', () => {
        expect(resolveProperty('', {})).toEqual({exists: false});
        expect(resolveProperty('.', {})).toEqual({exists: false});
        expect(resolveProperty('...', {})).toEqual({exists: false});
    });
});
