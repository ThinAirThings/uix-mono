import OpenAI, { OpenAIError } from 'openai';
import { Err } from '../types/Result';



export const createOpenAIClient = (config: {
    apiKey: string
}) => {
    return new OpenAI({
        apiKey: config.apiKey
    })
}

const uixAction = () => {

}

export const openAIAction = <
    Input extends any[],
    Output extends any
>(
    fn: (...args: Input) => Promise<Output>
) => async (
    ...args: Input
) => {
        try {
            return await fn(...args)
        } catch (e) {
            if (!(e instanceof OpenAIError)) throw e
            return e
        }
    }

export const OpenAIErr = (error: typeof OpenAIError) => Err('OpenAIError', error)