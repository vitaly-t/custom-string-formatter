import {resolveProperty} from '../src/prop';

describe('resolveProperty', () => {
    it('must resolve "this"', () => {
        const obj = {prop: 123};
        expect(resolveProperty(obj, 'this')).toStrictEqual({exists: true, value: obj});
        expect(resolveProperty(obj, 'this.prop')).toStrictEqual({exists: true, value: obj.prop});
    });
    it('must resolve deep properties', () => {
        const obj = {a: {b: {c: {d: 123}}}};
        expect(resolveProperty(obj, 'a.b.c.d')).toEqual({exists: true, value: 123});
    })
});
