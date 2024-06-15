
import React, { FC, useEffect } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';
import { Writable } from 'stream';
import { useStderr } from 'ink';

const nullStream = new Writable({
    write(chunk, encoding, callback) {
        // Do nothing with the chunk
        // You can reroute this to logs if you want
        callback();
    }
});
export const CommandEnvironment: FC<{
    Command: FC<any>
}> = ({
    Command
}) => {
        const { stderr } = useStderr()
        useEffect(() => {
            stderr.write = nullStream.write.bind(nullStream)
        }, [stderr])
        return (
            <ReactQueryProvider>
                <Command />
            </ReactQueryProvider>
        )
    }