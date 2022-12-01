import { describe, expect, test } from '@jest/globals';
import Router from './router';
import * as React from 'react';

describe('Test Router component', () => {
    const setState = jest.fn(a => [a, setState]);

    const useStateSpy = jest.spyOn(React, 'useState') as unknown as jest.SpyInstance<[unknown, React.Dispatch<unknown>], [unknown]>;
    useStateSpy.mockImplementation((initialState: unknown) => [initialState, setState]);

    const useEffectSpy = jest.spyOn(React, 'useEffect');
    useEffectSpy.mockImplementation(f => { f() });

    const useContextSpy = jest.spyOn(React, 'useContext');
    useContextSpy.mockImplementation(() => ({}));

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('empty', () => {
        const r = Router({});
        expect(r).toBeNull();
    });

    test('with child', () => {
        const r = Router({ children: 1 });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toStrictEqual(1);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
    });

    test('with children', () => {
        const r = Router({ children: [1, 2, 3] });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toStrictEqual([1, 2, 3]);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
    });

    test('with match and navigate props', () => {
        const match = (path: string, url: string) => ({});
        const navigate = jest.fn((p) => { });
        const r = Router({ children: [1, 2, 3], match, navigate });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toStrictEqual([1, 2, 3]);
        expect(r?.props.value.match).toBe(match);
        const prev = window.location.pathname;
        expect(prev).not.toBe('/path');
        r?.props.value.navigate?.('/path');
        expect(navigate).toHaveBeenCalled();
        expect(setState).toHaveBeenCalled();
        expect(window.location.pathname).toBe(prev);
    });

    test('default match', () => {
        const r = Router({ children: 1 });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe(1);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
        const m1 = r?.props.value.match?.('/path', '/test');
        expect(m1).toStrictEqual({});

        const m2 = r?.props.value.match?.('/path/:id', '/path/1');
        const result2 = ['/path/1', '1'] as any;
        result2.groups = undefined;
        result2.index = 0;
        result2.input = '/path/1';
        expect(m2).toMatchObject({ match: result2, params: { id: '1' }, nextPath: '/path/' });

        const m3 = r?.props.value.match?.('/:child', '/child/');
        const result3 = ['/child/', 'child'] as any;
        result3.groups = undefined;
        result3.index = 0;
        result3.input = '/child/';
        expect(m3).toMatchObject({ match: result3, params: { child: 'child' }, nextPath: '/' });

        const m4 = r?.props.value.match?.(':child', 'child');
        const result4 = ['child', 'child'] as any;
        result4.groups = undefined;
        result4.index = 0;
        result4.input = 'child';
        expect(m4).toMatchObject({ match: result4, params: { child: 'child' }, nextPath: '' });
    });

    test('default navigate', () => {
        const r = Router({ children: 1 });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe(1);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
        const data1 = {};
        r?.props.value.navigate?.('/path', data1, true);
        expect(setState).toHaveBeenCalled();
        expect(history.length).toBe(1);

        const data2 = {};
        r?.props.value.navigate?.('/path', data2, false);
        expect(history.state).toBe(data2);
        expect(setState).toHaveBeenCalled();
        expect(history.length).toBe(2);

        expect(window.location.pathname).toBe('/path');
    });

    test('with onUpdated prop', () => {
        const onUpdated = jest.fn(() => { });

        const r = Router({ children: 1, onUpdated });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe(1);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
        expect(onUpdated).toHaveBeenCalled();

        window.dispatchEvent(new Event('popstate'));

        expect(setState).toHaveBeenCalled();
    });
});