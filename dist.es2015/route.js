var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { RouteContext, RouterContext } from './context';
export default function Route(_a) {
    var _b;
    var children = _a.children, path = _a.path, error = _a.error;
    var router = React.useContext(RouterContext);
    var route = React.useContext(RouteContext);
    if (!router.match) {
        throw new Error('Route requires a match function in the Router context');
    }
    var routeParams = {};
    var routePath = (route.path || '') + (path || '');
    if (path) {
        var _c = router.match(routePath), match = _c.match, params = _c.params, nextPath = _c.nextPath;
        if (!match) {
            return null;
        }
        routeParams = params;
        routePath = nextPath;
        if (!route.matches) {
            route.matches = [];
        }
        route.matches.push({ match: match, params: params, nextPath: nextPath });
    }
    else {
        if (((_b = route.matches) === null || _b === void 0 ? void 0 : _b.length) || route.error) {
            return null;
        }
    }
    var childRoute = __assign(__assign({}, route), { path: routePath, params: routeParams, matches: [] });
    var props = { value: childRoute };
    if (Array.isArray(children)) {
        if (error) {
            return React.createElement(RouteContext.Provider, props, React.createElement.apply(React, __spreadArray([ErrorBoundary, { FallbackComponent: error }], children, false)));
        }
        return React.createElement.apply(React, __spreadArray([RouteContext.Provider, props], children, false));
    }
    if (error) {
        return React.createElement(RouteContext.Provider, props, React.createElement(ErrorBoundary, { FallbackComponent: error }, children));
    }
    return React.createElement(RouteContext.Provider, props, children);
}
