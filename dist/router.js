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
exports.default = Router;
var React = require("react");
var path_to_regexp_1 = require("path-to-regexp");
var context_1 = require("./context");
var defChangeEvent = 'popstate';
function defGetCurrentPath() {
    return window.location.pathname;
}
function defMatch(path) {
    var tokens = (0, path_to_regexp_1.parse)(path).tokens;
    var _a = (0, path_to_regexp_1.pathToRegexp)(path), regexp = _a.regexp, keys = _a.keys;
    var pathname = defGetCurrentPath();
    var match = regexp.exec(pathname);
    if (!match) {
        return {};
    }
    var params = {};
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].type === 'param' && match[i + 1]) {
            params[keys[i].name] = match[i + 1];
        }
    }
    var nextPath = tokens[0].type === 'text' ? tokens[0].value : '';
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
