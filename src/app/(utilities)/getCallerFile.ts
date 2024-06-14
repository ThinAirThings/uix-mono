



export const getCallerFile = () => {
    const originalFunc = Error.prepareStackTrace;

    let callerFile;
    try {
        const err = new Error();
        let currentFile;

        Error.prepareStackTrace = (err, stack) => stack;
        // @ts-ignore
        currentFile = err.stack.shift().getFileName();
        // @ts-ignore
        while (err.stack.length) {
            // @ts-ignore
            callerFile = err.stack.shift().getFileName();

            if (currentFile !== callerFile) break;
        }
    } catch (e) {
        console.log(e)
        // Handle any error if necessary
    }

    Error.prepareStackTrace = originalFunc;

    return callerFile;
};