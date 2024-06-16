import { ErrType, Result } from "./Result";
import { AnyErrType } from "./Result.js";




export type GenericAction = Action<any[], any, any>
export type Action<
    Input extends any[],
    T,
    ErrType extends AnyErrType
// ErrorType extends string,
// ErrorInfo extends Record<string, any>,
> = (...args: Input) => Promise<Result<T, ErrType>>