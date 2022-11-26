import React from 'react';
import { pathToRegexp } from 'path-to-regexp';
import { RouterContext, Params, PathMatch } from './context';

function defMatch(path: string, url: string): PathMatch {
    const keys = [];
    const pattern = pathToRegexp(path, keys);
    const match = pattern.exec(url);
    if (!match) {
        return {};
    }

    const params: Params = {};
    for (let i = 1; i < match.length; i++) {
        params[keys[i - 1].name] = match[i];
    }

    return { match, params };
}

function defNavigate(path: string, data?: any) {
    history.pushState(data, '', path);
}

function renderChildren(children: React.ReactNode) {
    if (Array.isArray(children)) {
        return children.map((c) => renderChildren(c));
    }

    return children;
}

export interface RouterProps extends React.PropsWithChildren {
    onUpdated?: () => void;
    navigate?: (p: string, data?: any) => void;
    match?: (path: string, url: string) => PathMatch;
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
        navigate(path: string, data?: any) {
            n(path, data);
            setPath(window.location.pathname);
        }
    };

    const routerChildren = renderChildren(children);

    const props = { value: router };

    if (Array.isArray(routerChildren)) {
        return React.createElement(RouterContext.Provider, props, ...routerChildren);
    }

    return React.createElement(RouterContext.Provider, props, routerChildren);
}