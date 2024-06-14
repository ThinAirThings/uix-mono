
import React, { FC } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';


export const Providers: FC<{
    Command: FC<any>
}> = ({
    Command
}) => {
        return (
            <ReactQueryProvider>
                <Command />
            </ReactQueryProvider>
        )
    }