import {resolveProperty} from '../src/resolver';

describe('resolveProperty', () => {
    it('must resolve "this"', () => {
        const obj = {prop: 123};
        expect(resolveProperty('this', obj)).toStrictEqual({exists: true, value: obj, parent: undefined});
        expect(resolveProperty('this.prop', obj)).toStrictEqual({exists: true, value: obj.prop, parent: obj});
    });
    it('must resolve deep properties', () => {
        const parent = {d: 123};
        const obj = {a: {b: {c: parent}}};
        expect(resolveProperty('a.b.c.d', obj)).toEqual({exists: true, value: 123, parent});
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
        const obj = {value: 123};
        expect(resolveProperty('a.1.value', {a: [0, obj]})).toEqual({exists: true, value: 123, parent: obj});
    });
    it('must handle array indexes outside range', () => {
        expect(resolveProperty('a.2', {a: [0, 1]})).toEqual({exists: false});
    });
});
