# react-router-slim
Declarative browser routing for react

## examples

The source codes are in the repository https://github.com/only-jsx/examples/tree/main/react-router-slim.

```tsx
//index.tsx
import React from 'react'
import { Router, Route } from 'react-router-slim';

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
        <Route path="/router/(.*)">
            <Layout />
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
