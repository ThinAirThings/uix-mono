
import React, { FC } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';

// const nullStream = new Writable({
//     write(chunk, encoding, callback) {
//         // Do nothing with the chunk
//         // You can reroute this to logs if you want
//         callback();
//     }
// });
// const { stderr } = useStderr()
// useEffect(() => {
//     stderr.write = nullStream.write.bind(nullStream)
// }, [stderr])
export const CommandEnvironment: FC<{
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