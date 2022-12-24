import * as React from 'react';

export interface Params {
    [key: string]: string;
}

export interface PathMatch {
    match?: RegExpExecArray | null;
    params?: Params;
    nextPath?: string;
}

export interface RouterContext {
    match?: (path: string) => PathMatch;
    navigate?: (path: string, data?: any, replace?: boolean) => void;
    getCurrentPath?: () => string;
}

export interface RouteContext {
    path?: string;
    params?: Params;
    matches?: PathMatch[];
    error?: Error;
}

export const RouteContext = React.createContext<RouteContext>({});
export const RouterContext = React.createContext<RouterContext>({});