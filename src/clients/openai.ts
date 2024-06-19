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
    message: string = error.message
) => Err('OpenAIError', message, error)

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
        | ErrType<'OpenAIError', InstanceType<typeof OpenAIError>>
    >
> => {
        try {
            return await fn(...args)
        } catch (e) {
            if (!(e instanceof OpenAIError)) throw e
            return OpenAIErr(e)
        }
    }

