import * as React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { RouteContext } from './context';
export interface RouteProps extends React.PropsWithChildren {
    path?: string;
    error?: React.ComponentType<FallbackProps>;
}
export default function Route({ children, path, error }: RouteProps): React.FunctionComponentElement<React.ProviderProps<RouteContext>> | null;
