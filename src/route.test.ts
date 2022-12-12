import { describe, expect, test } from '@jest/globals';
import Route from './route';
import Router from './router';
import { RouterContext, RouteContext, Params } from './context';
import * as React from 'react';

function defNavigate(path: string, data?: any, replace?: boolean) {
    if (replace) {
        history.replaceState(data, '', path);
    } else {
        history.pushState(data, '', path);
    }
}

describe('Test Route component', () => {

    const setState = jest.fn(a => [a, setState]);

    const useStateSpy = jest.spyOn(React, 'useState') as unknown as jest.SpyInstance<[unknown, React.Dispatch<unknown>], [unknown]>;
    useStateSpy.mockImplementation((initialState: unknown) => [initialState, setState]);

    const useEffectSpy = jest.spyOn(React, 'useEffect');
    useEffectSpy.mockImplementation(f => { f() });

    const defMatch = Router({ children: 1 })?.props.value.match;

    const router: RouterContext = {};
    const route: RouteContext = {}

    const useContextSpy = jest.spyOn(React, 'useContext');
    useContextSpy.mockImplementation((c) => {
        switch (c) {
            case RouterContext:
                return router;
            case RouteContext:
                return route;
        }
        return {};
    });

    beforeEach(() => {
        router.match = defMatch;
        router.navigate = defNavigate;
        route.path = '/';
        delete route.error;
        delete route.matches;
        delete route.params;
    });

    test('without Router', () => {
        delete router.match;
        expect(() => Route({})).toThrowError('Route requires a match function in the Router context');
    });

    test('without children', () => {
        const r = Route({});
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe(undefined);
        const context = r?.props as React.ProviderProps<RouteContext>;
        expect(context.value).toHaveProperty('matches');
        expect(context.value).toHaveProperty('params');
        expect(context.value).toHaveProperty('path');
    });

    test('empty', () => {
        const r = Route({ children: [1, 2, 3] });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toStrictEqual([1, 2, 3]);
        const context = r?.props as React.ProviderProps<RouteContext>;
        expect(context.value).toHaveProperty('matches');
        expect(context.value).toHaveProperty('params');
        expect(context.value).toHaveProperty('path');
    });

    test('empty route with matches', () => {
        route.matches = [{ match: null, params: {} }];
        const r = Route({ children: 1 });
        expect(r).toBeNull();
    });

    test('empty route with error', () => {
        route.error = new Error('Test error');
        const r = Route({ children: 1 });
        expect(r).toBeNull();
    });

    const testParentParameters = (name: string, params?: Params) =>
        test(name, () => {
            route.params = params;
            const r = Route({ children: '1' });
            expect(r).toHaveProperty('props');
            expect(r?.props.children).toBe('1');
            const context = r?.props as React.ProviderProps<RouteContext>;
            expect(context.value).toHaveProperty('matches');
            expect(context.value).toHaveProperty('params');
            expect(context.value).toHaveProperty('path');
        });

    testParentParameters('without parent parameters');
    testParentParameters('empty parent parameters', {});
    testParentParameters('one parent parameter', { '0': '1' });
    testParentParameters('many parent parameters', { id: '1', userId: '2', 0: '1', 1: '2' });

    test('correct path', () => {
        router.navigate?.('/parent/child');
        route.path = '/parent';
        const r = Route({ children: '1', path: '/child' });
        expect(r).toHaveProperty('props');
        expect(r?.props.children).toBe('1');
    });

    test('wrong parent path', () => {
        router.navigate?.('/parent/child');
        route.path = '/wrong';
        const r = Route({ children: '1', path: '/child' });
        expect(r).toBeNull();
    });

    test('wrong child path', () => {
        router.navigate?.('/parent/child');
        route.path = '/parent';
        const r = Route({ children: '1', path: '/wrong' });
        expect(r).toBeNull();
    });

    const testError = (name: string, children: any) =>
        test(name, () => {
            router.navigate?.('/parent/child');
            route.path = '/parent';
            const error = () =>
            ({
                type: 'div',
                props: {},
                key: null
            });
            const r = Route({ children, path: '/child', error });
            expect(r).toHaveProperty('props');
            expect((r?.props.children as React.ReactElement).props.FallbackComponent).toBe(error);
        });

    testError('with error boundary', '1');
    testError('with error boundary and children array', [1, 2, 3]);

    test('with exception', () => {
        router.navigate?.('/parent/child');
        route.path = '/parent';
        const error = () =>
        ({
            type: 'div',
            props: {},
            key: null
        });

        const children = {
            type: () => { throw Error('Test error') },
            props: {},
            key: null
        };

        const r = Route({ children, path: '/child', error });

        expect(r).toHaveProperty('props');
        expect((r?.props.children as React.ReactElement).props.FallbackComponent).toBe(error);
        expect((r?.props.children as React.ReactElement).props.children.type).toBe(children.type);
    });

    test('path', () => {
        const testPathHandle = (navigated: string, contextPath: string, path: string, nextPath: string, params: object) => {
            router.navigate?.(navigated);
            route.path = contextPath;
            const r1 = Route({ children: '1', path });
            expect(r1).toHaveProperty('props');
            const c = r1?.props as React.ProviderProps<RouteContext>;
            expect(c.children).toBe('1');
            expect(c.value.path).toBe(nextPath);
            expect(c.value.params).toStrictEqual(params);
        };

        testPathHandle('/parent1/parent2/child/', '/par\\ent1/parent2/', ':child/', '/parent1/parent2/', { child: 'child' });
        testPathHandle('/child1/child2/index.html', '/child1/', 'child2/(in)(.*).html', '/child1/child2/', { 0: 'in', 1: 'dex' });
        testPathHandle('/child1/child2/index.html', '', '/child1/:c1/(inde)(.*).html', '/child1/', { c1: 'child2', '0': 'inde', '1': 'x' });
        testPathHandle('/child1/child2', '/child1/', '(child2)', '/child1/', { 0: 'child2' });
        testPathHandle('/child1/child2/', '/child1/', 'child2/', '/child1/child2/', {});
        testPathHandle('/child1/', '', '/:child1', '/', { child1: 'child1' });
    });
});