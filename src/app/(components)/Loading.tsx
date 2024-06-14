
import Spinner from 'ink-spinner';
import React, { FC } from 'react';
import { Text } from 'ink';
export const Loading: FC<{
    text: string
}> = ({
    text
}) => {
        return (
            <Text color='green'>
                <Spinner type="dots" />
                {`   ${text}`}
            </Text>
        )
    }