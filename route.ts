import React from 'react';
import { RouteContext, RouterContext } from './context.js';

function renderChildren(children: React.ReactNode) {
    if (Array.isArray(children)) {
        return children.map(c => renderChildren(c));
    }
    return children;
}

export interface RouteProps extends React.PropsWithChildren {
    path?: string;
    error: React.ReactElement;
}

export default function Route({ children, path, error }: RouteProps) {
    const router = React.useContext(RouterContext);
    const route = React.useContext(RouteContext);

    if (!router.match) {
        return 'Route requires match in Router context';
    }

    if (route.params && Object.keys(route.params).length > 1) {
        return 'Parameters are not allowed in parent routes';
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
        if (Array.isArray(children)) {
            return React.createElement(RouteContext.Provider, props, ...routeChildren);
        } else {
            return React.createElement(RouteContext.Provider, props, routeChildren);
        }
    } catch (e) {
        childRoute.error = e;
        return React.createElement(RouteContext.Provider, props, error);
    }
}
