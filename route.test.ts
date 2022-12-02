import { describe, expect, test } from '@jest/globals';
import Route from './route';
import { RouterContext, RouteContext, PathMatch, Params } from './context';
import * as React from 'react';
import { tokensToRegexp, parse, Key } from 'path-to-regexp';

function defMatch(path: string, url: string): PathMatch {
    const keys = [];
    const tokens = parse(path);
    const pattern = tokensToRegexp(tokens, keys);
    const match = pattern.exec(url);
    if (!match) {
        return {};
    }

    const params: Params = {};
    for (let i = 1; i < match.length; i++) {
        params[keys[i - 1]['name']] = match[i];
    }

    let nextPath = '';
    if (typeof tokens?.[0] === 'string') {
        nextPath = (tokens[1] as Key)?.prefix ? tokens[0] + (tokens[1] as Key).prefix : tokens[0];
    } else {
        nextPath = (tokens?.[0] as Key).prefix || '';
    }

    return { match, params, nextPath };
}

function defNavigate(path: string, data?: any, replace?: boolean) {
    if (replace) {
        history.replaceState(data, '', path);
    } else {
        history.pushState(data, '', path);
    }
}

describe('Test Route component', () => {

    const router: RouterContext = {
        match: defMatch,
        navigate: defNavigate,
    }

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
        route.path = '/';
        delete route.error;
        delete route.matches;
        delete route.params;
    });

    test('without Router', () => {
        delete router.match;
        expect(()=>Route({})).toThrowError('Route requires a match function in the Router context');
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
    testParentParameters('many parent parameters', { id: '1', userId: '2', 0: '1', 1: '2'});

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
        router.navigate?.('/parent1/parent2/child/');
        route.path = '/par\\ent1/parent2/';
        const r1 = Route({ children: '1', path: ':child/' });
        expect(r1).toHaveProperty('props');
        const context1 = r1?.props as React.ProviderProps<RouteContext>;
        expect(context1.children).toBe('1');
        expect(context1.value.path).toBe('/parent1/parent2/');

        router.navigate?.('/child1/child2/index.html');
        route.path = '/child1/';
        const r2 = Route({ children: '1', path: 'child2/(in)(.*).html' });
        expect(r2).toHaveProperty('props');
        const context2 = r2?.props as React.ProviderProps<RouteContext>;
        expect(context2.children).toBe('1');
        expect(context2.value.path).toBe('/child1/child2/');

        router.navigate?.('/child1/child2/index.html');
        route.path = '';
        const r3 = Route({ children: '1', path: '/child1/:c1/(inde)(.*).html' });
        expect(r3).toHaveProperty('props');
        const context3 = r3?.props as React.ProviderProps<RouteContext>;
        expect(context3.children).toBe('1');
        expect(context3.value.path).toBe('/child1/');
        expect(context3.value.params).toStrictEqual({ c1: 'child2', '0': 'inde', '1': 'x' });

        router.navigate?.('/child1/child2');
        route.path = '/child1/';
        const r4 = Route({ children: '1', path: '(child2)' });
        expect(r4).toHaveProperty('props');
        const context4 = r4?.props as React.ProviderProps<RouteContext>;
        expect(context4.children).toBe('1');
        expect(context4.value.path).toBe('/child1/');

        router.navigate?.('/child1/child2/');
        route.path = '/child1/';
        const r5 = Route({ children: '1', path: 'child2/' });
        expect(r5).toHaveProperty('props');
        const context5 = r5?.props as React.ProviderProps<RouteContext>;
        expect(context5.children).toBe('1');
        expect(context5.value.path).toBe('/child1/child2/');

        router.navigate?.('/child1/');
        route.path = '';
        const r6 = Route({ children: '1', path: '/:child1' });
        expect(r6).toHaveProperty('props');
        const context6 = r6?.props as React.ProviderProps<RouteContext>;
        expect(context6.children).toBe('1');
        expect(context6.value.path).toBe('/');
    });
});