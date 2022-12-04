# react-router-slim
Declarative browser routing for React Web Applications

The default browser history routing strategy can be replaced with
custom routing strategy (hash, memory, etc.) via Router component props: match, navigate, changeEvent, getCurrentPath.
Our examples also demonstrate how to implement URL hash routing.
It does not provide server side routing. You can use the routing provided by your back-end API for this.

## examples

The source codes are in the repository https://github.com/only-jsx/react-router-slim-examples

```tsx
//index.tsx
import React from 'react'
import { Router, Route, RouterContext, RouteContext } from 'react-router-slim';

interface LinkProps extends React.PropsWithChildren {
    to: string;
}

const Link = ({ children, to }: LinkProps) => {
    const router = React.useContext(RouterContext);
    const navigate = router.navigate;
    const onClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate?.(to);
    }, [to, navigate]);

    return <a href={to} onClick={onClick}>{children}</a>
}

const RoutedSpan = ({ children }) => {
    const route = React.useContext(RouteContext);

    if (!route) {
        return 'Routes are not allowed outside the Router component';
    }

    const { params } = route;
    return <span>{children} {params.toString()}</span>;
}

const RoutedButton = ({ children }) => {
    const router = React.useContext(RouterContext);

    if (!router.navigate) {
        return 'Routes navigate is not defined';
    }

    return <button onClick={(e) => router.navigate('/hello/world', {state: 0}, true)}>{children}</button>;
}

const App = () => {
    return <Router>
        {/*Regular expressions in path*/}
        <Route path="/router/(.*)">
            <Layout />
            {/*Part of a parent route path before any named parameter or regexp*/}
            {/*becames a prefix for a child route*/}
            {/*so this actually matches to /router/home*/}
            <Route path="home">
                <RoutedSpan>RoutedSpan</RoutedSpan>
                <RoutedButton>RoutedButton</RoutedButton>
                <Link to="/hello/world">Link</Link>
            </Route>
            <Route path="await"><AwaitPage/></Route>
            <Route path="long-load"><LongLoad/></Route>
            <Route path="todos" error={ErrorBoundary}>
                <TodosList/>
            </Route>
            <Route path="todos/(.*)" error={ErrorBoundary}>
                <h5>Todo</h5>
                {/*Named parameters*/}
                <Route path=":id"><Todo/></Route>
            </Route>
            <Route path="error" error={ErrorBoundary}><ErrorComponent/></Route>
            {/*Route without a path is a fallback route*/}
            <Route><Fallback /></Route>
        </Route>
    </Router>;
}

export default App;
```
