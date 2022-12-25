"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var path_to_regexp_1 = require("path-to-regexp");
var context_1 = require("./context");
var defChangeEvent = 'popstate';
function defGetCurrentPath() {
    return window.location.pathname;
}
function defMatch(path) {
    var _a;
    var keys = [];
    var tokens = (0, path_to_regexp_1.parse)(path);
    var pattern = (0, path_to_regexp_1.tokensToRegexp)(tokens, keys);
    var pathname = defGetCurrentPath();
    var match = pattern.exec(pathname);
    if (!match) {
        return {};
    }
    var params = {};
    for (var i = 1; i < match.length; i++) {
        params[keys[i - 1]['name']] = match[i];
    }
    var nextPath = '';
    if (typeof tokens[0] === 'string') {
        nextPath = ((_a = tokens[1]) === null || _a === void 0 ? void 0 : _a.prefix) ? tokens[0] + tokens[1].prefix : tokens[0];
    }
    else {
        nextPath = tokens[0].prefix || '';
    }
    return { match: match, params: params, nextPath: nextPath };
}
function defNavigate(path, data, replace) {
    if (replace) {
        window.history.replaceState(data, '', path);
    }
    else {
        window.history.pushState(data, '', path);
    }
}
function Router(props) {
    var children = props.children, _a = props.navigate, n = _a === void 0 ? defNavigate : _a, _b = props.match, m = _b === void 0 ? defMatch : _b, _c = props.changeEvent, c = _c === void 0 ? defChangeEvent : _c, _d = props.getCurrentPath, g = _d === void 0 ? defGetCurrentPath : _d;
    var _e = React.useState(g()), path = _e[0], setPath = _e[1];
    React.useEffect(function () {
        if (!c) {
            return;
        }
        var eventHandler = function () { return setPath(g()); };
        window.addEventListener(c, eventHandler);
        return function () { return window.removeEventListener(c, eventHandler); };
    }, [c, g, setPath]);
    if (!children) {
        return null;
    }
    var routerProps = {
        value: {
            match: m,
            navigate: function (p, data, replace) {
                n(p, data, replace);
                setPath(g());
            },
            getCurrentPath: g,
        }
    };
    var baseRouteProps = { value: {} };
    var routeProvider = Array.isArray(children)
        ? React.createElement.apply(React, __spreadArray([context_1.RouteContext.Provider, baseRouteProps], children, false)) : React.createElement(context_1.RouteContext.Provider, baseRouteProps, children);
    return React.createElement(context_1.RouterContext.Provider, routerProps, routeProvider);
}
exports.default = Router;
