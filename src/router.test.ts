import { describe, expect, test } from '@jest/globals';
import { RouterContext, RouteContext } from './context';
import Router from './router';
import * as React from 'react';

describe('Test Router component', () => {

    const setState: any = jest.fn(a => [a, setState]);

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

    function providerCildren(r: React.FunctionComponentElement<React.ProviderProps<RouterContext>> | null) {
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toHaveProperty('props');
        expect(r?.props.value).toHaveProperty('match');
        expect(r?.props.value).toHaveProperty('navigate');

        const rr = r?.props.children as React.FunctionComponentElement<React.ProviderProps<RouteContext>>;
        expect(rr?.props.value).toStrictEqual({});

        return rr.props.children;
    }

    test('with child', () => {
        const r = Router({ children: 1 });
        const children = providerCildren(r);
        expect(children).toStrictEqual(1);
    });

    test('with children', () => {
        const r = Router({ children: [1, 2, 3] });
        const children = providerCildren(r);
        expect(children).toStrictEqual([1, 2, 3]);
    });

    test('with match, navigate, changeEvent and getCurrentPath props', () => {
        const match = (path: string) => ({});
        const navigate = jest.fn((p) => { window.location.hash = p });
        const changeEvent = 'hashchange';
        const getCurrentPath = () => window.location.hash;

        const r = Router({ children: [1, 2, 3], match, navigate, changeEvent, getCurrentPath });
        const children = providerCildren(r);
        expect(children).toStrictEqual([1, 2, 3]);
        expect(r?.props.value.match).toBe(match);
        const prev = getCurrentPath();
        expect(prev).not.toBe('/path');
        r?.props.value.navigate?.('/path');
        expect(navigate).toHaveBeenCalled();
        expect(setState).toHaveBeenCalledTimes(1);
        expect(getCurrentPath()).toBe('#/path');

        window.dispatchEvent(new Event(changeEvent));
        expect(setState).toHaveBeenCalledTimes(2);
    });

    test('default match', () => {
        const r = Router({ children: 1, changeEvent: '' });
        const children = providerCildren(r);
        expect(children).toStrictEqual(1);
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
        const children = providerCildren(r);
        expect(children).toStrictEqual(1);
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

    test('popstate event', () => {
        const r = Router({ children: 1 });
        const children = providerCildren(r);
        expect(children).toStrictEqual(1);

        expect(setState).not.toHaveBeenCalled();

        window.dispatchEvent(new Event('popstate'));

        expect(setState).toHaveBeenCalled();
    });
});