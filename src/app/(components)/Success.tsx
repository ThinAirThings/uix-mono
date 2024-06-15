import React, { FC } from 'react'
import { Text, Box } from 'ink'


export const Success: FC<{
    message: string
}> = ({
    message
}) => {
        return (
            <Text>✅ {message}</Text>
        )
    }