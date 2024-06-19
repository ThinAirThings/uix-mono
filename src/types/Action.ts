import { AnyErrType, Result } from "./Result.js";




export type GenericAction = Action<any[], any, any>
export type Action<
    Input extends any[],
    T,
    ErrType extends AnyErrType
> = (...args: Input) => Promise<Result<T, ErrType>>