import * as React from 'react';
import { tokensToRegexp, parse, Key } from 'path-to-regexp';
import { RouterContext, Params, PathMatch } from './context';

function defMatch(path: string): PathMatch {
    const keys: Key[] = [];
    const tokens = parse(path);
    const pattern = tokensToRegexp(tokens, keys);

    const { pathname } = window.location;
    const match = pattern.exec(pathname);
    if (!match) {
        return {};
    }

    const params: Params = {};
    for (let i = 1; i < match.length; i++) {
        params[keys[i - 1]['name']] = match[i];
    }

    let nextPath = '';
    if (typeof tokens[0] === 'string') {
        nextPath = (tokens[1] as Key)?.prefix ? tokens[0] + (tokens[1] as Key).prefix : tokens[0];
    } else {
        nextPath = tokens[0].prefix || '';
    }

    return { match, params, nextPath };
}

function defNavigate(path: string, data?: any, replace?: boolean) {
    if (replace) {
        window.history.replaceState(data, '', path);
    } else {
        window.history.pushState(data, '', path);
    }
}

const defChangeEvent = 'popstate';

function defGetCurrentPath() {
    return window.location.pathname;
}

export interface RouterProps extends React.PropsWithChildren {
    onUpdated?: () => void;
    navigate?: (path: string, data?: any, replace?: boolean) => void;
    match?: (path: string) => PathMatch;
    changeEvent?: string;
    getCurrentPath?: () => string;
}

export default function Router(props: RouterProps) {
    const { children, onUpdated, navigate: n = defNavigate, match: m = defMatch, changeEvent: c = defChangeEvent, getCurrentPath: g = defGetCurrentPath } = props;
    const router: RouterContext = {
        match: m,
        navigate(path: string, data?: any, replace?: boolean) {
            n(path, data, replace);
            setPath(window.location.pathname);
        },
        changeEvent: c,
        getCurrentPath: g,
    };

    const [path, setPath] = React.useState(router.getCurrentPath());

    React.useEffect(() => { onUpdated?.(); }, [path]);

    React.useEffect(() => {
        function onPopState() {
            setPath(router.getCurrentPath());
        }

        if (router.changeEvent && router.getCurrentPath) {
            window.addEventListener(router.changeEvent, onPopState);

            return () => window.removeEventListener(router.changeEvent, onPopState);
        }
    }, [router.changeEvent, router.getCurrentPath]);

    if (!children) {
        return null;
    }

    const providerProps = { value: router };

    if (Array.isArray(children)) {
        return React.createElement(RouterContext.Provider, providerProps, ...children);
    }

    return React.createElement(RouterContext.Provider, providerProps, children);
}