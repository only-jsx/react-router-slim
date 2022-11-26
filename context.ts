import React from 'react';

export interface Params {
    [key: string]: string;
}

export interface PathMatch {
    match?: RegExpExecArray | null;
    params?: Params;
}

export interface RouterContext {
    match?: (path: string, url: string) => PathMatch;
    navigate?: (path: string, data?: any)=> void;
}

export interface RouteContext {
    path?: string;
    params?: Params;
    matches?: PathMatch[];
    error?: Error;
}

export const RouteContext = React.createContext<RouteContext>({});
export const RouterContext = React.createContext<RouterContext>({});