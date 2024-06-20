import { AnyErrType, Result } from "./Result.js";




export type GenericAction = Action<any[], any, any>
export type Action<
    Input extends any[],
    DataType,
    ErrType extends AnyErrType
> = (...args: Input) => Promise<Result<DataType, ErrType>>