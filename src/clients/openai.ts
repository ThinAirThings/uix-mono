import OpenAI, { OpenAIError } from 'openai';
import { AnyErrType, Err, ErrType, Result } from '../types/Result';
import { Action } from '../types/Action';



export const createOpenAIClient = (config: {
    apiKey: string
}) => new OpenAI({
    apiKey: config.apiKey
})


export const OpenAIErr = (
    error: InstanceType<typeof OpenAIError>,
) => Err({
    type: 'OpenAIError',
    subtype: OpenAIErrorSubtype.UNKNOWN,
    message: error.message,
    data: JSON.parse(JSON.stringify(error))
})

export enum OpenAIErrorSubtype {
    UNKNOWN = 'UNKNOWN',
}

export const openAIAction = <
    Input extends any[],
    T,
    PrevErrType extends AnyErrType
>(
    fn: Action<Input, T, PrevErrType>
) => async (
    ...args: Input
): Promise<
    Result<T,
        | PrevErrType
        | ErrType<'OpenAIError', OpenAIErrorSubtype, InstanceType<typeof OpenAIError>>
    >
> => {
        try {
            return await fn(...args)
        } catch (e) {
            if (!(e instanceof OpenAIError)) throw e
            return OpenAIErr(e)
        }
    }

