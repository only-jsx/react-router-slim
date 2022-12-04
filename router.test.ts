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
        const match = (path: string) => ({});
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

        r?.props.value.navigate?.('/wrong');
        const m1 = r?.props.value.match?.('/path');
        expect(m1).toStrictEqual({});

        const testMatch = (navigated: string, path: string, mr: string[], params: object, nextPath: string) => {
            r?.props.value.navigate?.(navigated);
            const m = r?.props.value.match?.(path);
            const match = [...mr] as any;
            match.groups = undefined;
            match.index = 0;
            match.input = mr[0];
            expect(m).toMatchObject({ match, params, nextPath });
        }

        testMatch('/path/1', '/path/:id', ['/path/1', '1'], { id: '1' }, '/path/');
        testMatch('/path/1/2', '/path/1/:id', ['/path/1/2', '2'], { id: '2' }, '/path/1/');
        testMatch('/child/', '/:child', ['/child/', 'child'], { child: 'child' }, '/');
        testMatch('/child', '/:child', ['/child', 'child'], { child: 'child' }, '/');
        testMatch('/child', '(/child)', ['/child', '/child'], { 0: '/child' }, '');
    });

    test('default navigate', () => {
        const r = Router({ children: 1 });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe(1);
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');
        const data1 = {};
        r?.props.value.navigate?.('/path', data1, true);
        expect(history.state).toBe(data1);
        expect(setState).toHaveBeenCalled();

        const data2 = {};
        r?.props.value.navigate?.('/path', data2, false);
        expect(history.state).toBe(data2);
        expect(setState).toHaveBeenCalled();
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