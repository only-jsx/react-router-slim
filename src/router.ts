import * as React from 'react';
import { pathToRegexp, parse } from 'path-to-regexp';
import { RouterContext, RouteContext, Params, PathMatch } from './context';

const defChangeEvent = 'popstate';

function defGetCurrentPath() {
    return window.location.pathname;
}

function defMatch(path: string): PathMatch {
    const { tokens } = parse(path);
    const { regexp, keys } = pathToRegexp(path);

    const pathname = defGetCurrentPath();

    const match = regexp.exec(pathname);

    if (!match) {
        return {};
    }

    const params: Params = {};

    for (let i = 0; i < keys.length; i++) {
        if (keys[i].type === 'param' && match[i + 1]) {
            params[keys[i].name] = match[i + 1];
        }
    }

    const nextPath = tokens[0].type === 'text' ? tokens[0].value : '';

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
    navigate?: (path: string, data?: any, replace?: boolean) => void;
    match?: (path: string) => PathMatch;
    changeEvent?: string;
    getCurrentPath?: () => string;
}

export default function Router(props: RouterProps) {
    const { children, navigate: n = defNavigate, match: m = defMatch, changeEvent: c = defChangeEvent, getCurrentPath: g = defGetCurrentPath } = props;

    const [path, setPath] = React.useState(g());

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
            getCurrentPath: g,
        }
    };

    const baseRouteProps = { value: {} };

    const routeProvider = Array.isArray(children)
        ? React.createElement(RouteContext.Provider, baseRouteProps, ...children)
        : React.createElement(RouteContext.Provider, baseRouteProps, children);

    return React.createElement(RouterContext.Provider as (React.FunctionComponent<React.ProviderProps<RouterContext>> | React.ComponentClass<React.ProviderProps<RouterContext>> | string), routerProps, routeProvider);
}
