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
    it('must handle array indexes', () => {
        expect(resolveProperty('a.1.value', {a: [0, {value: 123}]})).toEqual({exists: true, value: 123});
    });
    it('must handle array indexes outside range', () => {
        expect(resolveProperty('a.2', {a: [0, 1]})).toEqual({exists: false});
    });
});
