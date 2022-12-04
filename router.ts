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

export interface RouterProps extends React.PropsWithChildren {
    onUpdated?: () => void;
    navigate?: (path: string, data?: any, replace?: boolean) => void;
    match?: (path: string) => PathMatch;
}

export default function Router({ children, onUpdated, navigate: n = defNavigate, match: m = defMatch }: RouterProps) {

    const [path, setPath] = React.useState(window.location.pathname);

    React.useEffect(() => { onUpdated?.(); }, [path]);

    React.useEffect(() => {
        function onPopState() {
            setPath(window.location.pathname);
        }

        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    if (!children) {
        return null;
    }

    const router = {
        match: m,
        navigate(path: string, data?: any, replace?: boolean) {
            n(path, data, replace);
            setPath(window.location.pathname);
        }
    };

    const props = { value: router };

    if (Array.isArray(children)) {
        return React.createElement(RouterContext.Provider, props, ...children);
    }

    return React.createElement(RouterContext.Provider, props, children);
}