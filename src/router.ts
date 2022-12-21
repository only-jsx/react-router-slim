import * as React from 'react';
import { tokensToRegexp, parse, Key } from 'path-to-regexp';
import { RouterContext, RouteContext, Params, PathMatch } from './context';

const defChangeEvent = 'popstate';

function defGetCurrentPath() {
    return window.location.pathname;
}

function defMatch(path: string): PathMatch {
    const keys: Key[] = [];
    const tokens = parse(path);
    const pattern = tokensToRegexp(tokens, keys);

    const pathname = defGetCurrentPath();
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
    changeEvent?: string;
    getCurrentPath?: () => string;
}

export default function Router(props: RouterProps) {
    const { children, onUpdated, navigate: n = defNavigate, match: m = defMatch, changeEvent: c = defChangeEvent, getCurrentPath: g = defGetCurrentPath } = props;

    const [path, setPath] = React.useState(g());

    React.useEffect(() => onUpdated?.(), [path]);

    React.useEffect(() => {
        if (!c) {
            return;
        }

        const eventHandler = () => setPath(g());

        window.addEventListener(c, eventHandler);

        return () => window.removeEventListener(c, eventHandler);
    }, [c, g, setPath]);

    if (!children) {
        return null;
    }

    const routerProps = {
        value: {
            match: m,
            navigate(p: string, data?: any, replace?: boolean) {
                n(p, data, replace);
                setPath(g());
            },
        }
    };

    const baseRouteProps = { value: {} };

    const routeProvider = Array.isArray(children)
        ? React.createElement(RouteContext.Provider, baseRouteProps, ...children)
        : React.createElement(RouteContext.Provider, baseRouteProps, children);

    return React.createElement(RouterContext.Provider, routerProps, routeProvider);
}
