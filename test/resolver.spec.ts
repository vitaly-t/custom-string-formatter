import {resolveProperty} from '../src/resolver';
import {unique} from 'typedoc/dist/lib/utils-common';

describe('resolveProperty', () => {
    it('must resolve "this"', () => {
        const obj = {prop: 123};
        expect(resolveProperty('this', obj)).toStrictEqual({
            exists: true,
            value: obj,
            context: {path: 'this', parent: undefined}
        });
        expect(resolveProperty('this.prop', obj)).toStrictEqual({
            exists: true,
            value: obj.prop,
            context: {path: 'this.prop', parent: obj}
        });
    });
    it('must resolve deep properties', () => {
        const parent = {d: 123};
        const obj = {a: {b: {c: parent}}};
        expect(resolveProperty('a.b.c.d', obj)).toStrictEqual({
            exists: true,
            value: 123,
            context: {path: 'a.b.c.d', parent: parent}
        });
    });
    it('it must handle missing properties', () => {
        const obj = {a: {b: null}};
        expect(resolveProperty('a.b.c', obj)).toStrictEqual({
            exists: false,
            context: {path: 'a.b.c', parent: undefined}
        });
    });
    it('it must handle a no-properties', () => {
        expect(resolveProperty('', {})).toStrictEqual({exists: false, context: {path: '', parent: undefined}});
        expect(resolveProperty('.', {})).toStrictEqual({exists: false, context: {path: '.', parent: undefined}});
        expect(resolveProperty('...', {})).toStrictEqual({exists: false, context: {path: '...', parent: undefined}});
    });
    it('must handle array indexes', () => {
        const obj = {value: 123};
        expect(resolveProperty('a.1.value', {a: [0, obj]})).toStrictEqual({
            exists: true,
            value: 123,
            context: {path: 'a.1.value', parent: obj}
        });
    });
    it('must handle array indexes outside range', () => {
        expect(resolveProperty('a.2', {a: [0, 1]})).toStrictEqual({
            exists: false,
            context: {path: 'a.2', parent: undefined}
        });
    });
});
