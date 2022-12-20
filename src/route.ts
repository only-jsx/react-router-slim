import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouteContext, RouterContext, Params } from './context';

export interface RouteProps extends React.PropsWithChildren {
    path?: string;
    error?: React.ComponentType<FallbackProps>;
}

export default function Route({ children, path, error }: RouteProps) {
    const router = React.useContext<RouterContext>(RouterContext);

    if (!router.match) {
        throw new Error('Route requires a match function in the Router context');
    }

    const route = React.useContext<RouteContext>(RouteContext);

    let routeParams : Params | undefined = {};
    let routePath : string | undefined = (route.path || '') + (path || '');

    if (path) {
        const { match, params, nextPath } = router.match(routePath);

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
