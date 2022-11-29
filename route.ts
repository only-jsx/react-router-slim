import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouteContext, RouterContext } from './context.js';

function renderChildren(children: React.ReactNode) {
    if (Array.isArray(children)) {
        return children.map(c => renderChildren(c));
    }
    return children;
}

export interface RouteProps extends React.PropsWithChildren {
    path?: string;
    error?: React.ComponentType<FallbackProps>;
}

export default function Route({ children, path, error }: RouteProps) {
    const router = React.useContext<RouterContext>(RouterContext);
    const route = React.useContext<RouteContext>(RouteContext);

    if (!router.match) {
        return React.createElement(React.Fragment, null, 'Route requires match in Router context');
    }

    if (route.params && Object.keys(route.params).length > 1) {
        return React.createElement(React.Fragment, null, 'Parameters are not allowed in parent routes');
    }

    let routeParams = {};
    let routePath = (route.path || '') + (path || '');

    if (path) {
        const { match, params } = router.match(routePath, window.location.pathname);

        if (!match) {
            return null;
        }

        routeParams = params;

        if (!route.matches) {
            route.matches = [];
        }

        route.matches.push({ match, params });

        if (match.length > 1) {
            routePath = match[0].substring(0, match[0].length - match[1].length);
        }
    } else {
        if (route.matches?.length || route.error) {
            return null;
        }
    }

    const childRoute = { ...route, path: routePath, params: routeParams, matches: [] };

    const props = { value: childRoute };

    try {
        const routeChildren = renderChildren(children);
        if (Array.isArray(routeChildren)) {
            if (error) {
                return React.createElement(RouteContext.Provider, props, React.createElement(ErrorBoundary, { FallbackComponent: error }, ...routeChildren));
            }

            return React.createElement(RouteContext.Provider, props, ...routeChildren);

        } else {
            if (error) {
                return React.createElement(RouteContext.Provider, props, React.createElement(ErrorBoundary, { FallbackComponent: error }, routeChildren));
            }

            return React.createElement(RouteContext.Provider, props, routeChildren);
        }

    } catch (e) {
        if (error) {
            childRoute.error = e;
            return React.createElement(RouteContext.Provider, props, React.createElement(error, { error: e, resetErrorBoundary: () => { } }));
        }
        return null;
    }
}
