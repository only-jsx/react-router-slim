import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouteContext, RouterContext } from './context';

export interface RouteProps extends React.PropsWithChildren {
    path?: string;
    error?: React.ComponentType<FallbackProps>;
}

export default function Route({ children, path, error }: RouteProps) {
    const router = React.useContext<RouterContext>(RouterContext);

    if (!router.match) {
        return React.createElement(React.Fragment, null, 'Route requires match in Router context');
    }

    const route = React.useContext<RouteContext>(RouteContext);

    if (route.params) {
        const keys = Object.keys(route.params);
        if (keys.length > 1 || keys.length && keys[0] != '0') {
            return React.createElement(React.Fragment, null, 'Parameters are not allowed in parent routes');
        }
    }

    let routeParams = {};
    let routePath = (route.path || '') + (path || '');
    const { pathname } = window.location;

    if (path) {
        const { match, params, nextPath } = router.match(routePath, pathname);

        if (!match) {
            return null;
        }

        routeParams = params;
        routePath = nextPath;

        if (!route.matches) {
            route.matches = [];
        }

        route.matches.push({ match, params, nextPath });

    } else {
        if (route.matches?.length || route.error) {
            return null;
        }
    }

    const childRoute = { ...route, path: routePath, params: routeParams, matches: [] };

    const props = { value: childRoute };

    if (Array.isArray(children)) {
        if (error) {
            return React.createElement(RouteContext.Provider, props, React.createElement(ErrorBoundary, { FallbackComponent: error }, ...children));
        }

        return React.createElement(RouteContext.Provider, props, ...children);
    }

    if (error) {
        return React.createElement(RouteContext.Provider, props, React.createElement(ErrorBoundary, { FallbackComponent: error }, children));
    }

    return React.createElement(RouteContext.Provider, props, children);
}
