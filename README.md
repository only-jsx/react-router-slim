# react-router-slim
Declarative browser routing for react

## examples

The source codes are in the repository https://github.com/only-jsx/examples/tree/main/react-router-slim.

```tsx
//index.tsx
import React from 'react'
import { Router, Route } from 'react-router-slim';

const App = () => {
    return <Router>
        <Route path="/router/(.*)">
            <Layout />
            <Route path="home"><Home /></Route>
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
