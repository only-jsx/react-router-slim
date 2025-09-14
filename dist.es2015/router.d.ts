import * as React from 'react';
import { RouterContext, PathMatch } from './context';
export interface RouterProps extends React.PropsWithChildren {
    navigate?: (path: string, data?: any, replace?: boolean) => void;
    match?: (path: string) => PathMatch;
    changeEvent?: string;
    getCurrentPath?: () => string;
}
export default function Router(props: RouterProps): React.ReactElement<React.ProviderProps<RouterContext>, string | React.JSXElementConstructor<any>> | null;
