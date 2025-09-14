# react-router-slim
Declarative browser routing for React Web Applications.

Routing rules are declared using Router and Route components.

### Router
**Router** is a root component that declares a route dependent part of an application.

*Router* props:
- navigate - method for navigation between routers;
- match - method that matches current path with path argument and returns the result with matched params;
- changeEvent - name of an event that may change the current path. Router listens for this event and updates content when the event is fired;
- getCurrentPath - method for retrieving the current path;
    
Default implementation relies on the browser History API for the frontend routing, so 
default implementation of *navigate* is *window.history.pushState* or *window.history.replaceState*,
*changeEvent* is  *popstate*, and *getCurrentPath* returns *window.location.pathname*.

Default implementation of the *match* function uses the *pathToRegexp* function from the *path-to-regexp* library https://github.com/pillarjs/path-to-regexp. All rules for the *path* argument of *pathToRegexp* function work for the *path* prop value of a child *Route* component.

*Router* provides the *RouterContext* to children.
*RouterContext* contains only two functions: *match* and *navigate* from the *Router* component. *Match* is usually used by child *Route* components. *Navigate* is used by children to trigger transitions between routes.

### Route
**Route** is a child component of the *Router* that controls rendering of its children depending on the current router path.

*Route* props:
- path - path which Route renders children for;
- error - component that is rendered in case of any errors in route children;

*Route* provides the *RouteContext* to children.
*RouteContext* properties are:
- path - current router path;
- params - template parameters of a route;
- matches - all path matches (may contains more than one in case of overlapped routes);
- error - error raised by one of children;

If Route's paths are overlapped then both are rendered.

The default browser history routing strategy can be replaced with custom routing strategy (hash, memory, etc.) via *Router* component props: *match*, *navigate*, *changeEvent*, *getCurrentPath*.

**It does not provide server side routing.** You can use the routing provided by your back-end API for this.

## Examples
Our examples also demonstrate how to implement URL hash routing.

### Simple
```tsx
const App = () => <Router>
    <Route path="/(.*)">
        <Route path="path1">{child1}</Route>
        {/* "path2/:param" and "path2/(.*)" are overlapped, both are rendered */}
        {/* this component has params.param === ...rest of path... */}
        <Route path="path2/:param">{child21}</Route>
        {/* this component has params[0] === ...rest of path... */}
        <Route path="path2/(.*)">{child22}</Route>
        <Route path="path3/(.*)">{child3}</Route>
        {/* this is a fallback route */}
        <Route>{fallback}</Route>
    </Route>
</Router>;
```
### More complicated
The source codes are in the repository https://github.com/only-jsx/react-router-slim-examples

```tsx
//index.tsx
import React from 'react'
import { Router, Route, RouterContext, RouteContext } from 'react-router-slim';

interface LinkProps extends React.PropsWithChildren {
    to: string;
}

//Router Link component implementation
const Link = ({ children, to, replace }: LinkProps) => {
    const router = React.useContext(RouterContext);
    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.navigate?.(to, undefined, replace);
    };

    return <a href={to} onClick={onClick}>{children}</a>
}

//It uses Route paramaters
const RoutedSpan = ({ children }) => {
    const route = React.useContext(RouteContext);

    if (!route) {
        throw new Error('RoutedSpan is not allowed outside the Router component');
    }

    const { params } = route;
    return <span>{children} {params.toString()}</span>;
}

//It does navigation to other routes
const LinkButton = ({ children }) => {
    const router = React.useContext(RouterContext);

    if (!router.navigate) {
        throw new Error('Router navigate is not defined');
    }

    return <button onClick={(e) => router.navigate('/hello/world', {state: 0}, true)}>{children}</button>;
}

const App = () => <Router>
    {/* Regular expressions in path with wildcard */}
    <Route path="/router/*wildcard">
        <Layout />
        {/* Part of a parent route path before any named parameter or wildcard */}
        {/* becames a prefix for a child route */}
        {/* so this actually matches to /router/home */}
        <Route path="home">
            <RoutedSpan>RoutedSpan</RoutedSpan>
            <LinkButton>LinkButton</LinkButton>
            <Link to="/hello/world">Link</Link>
        </Route>
        <Route path="await{/:optional}/status"><AwaitPage/></Route>
        <Route path="long-load"><LongLoad/></Route>
        <Route path="todos" error={ErrorBoundary}>
            <TodosList/>
        </Route>
        <Route path="todos/*todo" error={ErrorBoundary}>
            <h5>Todo</h5>
            {/* Named parameters */}
            <Route path=":id"><Todo/></Route>
        </Route>
        <Route path="error" error={ErrorBoundary}><ErrorComponent/></Route>
        {/* Route without a path is a fallback route */}
        <Route><Fallback /></Route>
    </Route>
</Router>;
```
