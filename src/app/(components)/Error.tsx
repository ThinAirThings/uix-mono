
import React, { FC } from 'react'
import { Text, Box } from 'ink'
import { UixErr } from '../../types/Result'

export const Error: FC<{
    message: string,
    error: NonNullable<ReturnType<typeof UixErr>['error']>
    isBugReport?: boolean
}> = ({
    message,
    error,
    isBugReport
}) => {
        return (
            <Box flexDirection='column'>
                <Text>❌ {message}</Text>
                {isBugReport && <>
                    <Text color='red'>Please file a bug report!</Text>
                    <Box borderStyle={'round'}>
                        <Text wrap='wrap'>  Message: {error.message}</Text>
                    </Box>
                </>}
            </Box>
        )
    }