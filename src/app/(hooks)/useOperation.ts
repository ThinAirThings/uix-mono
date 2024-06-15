
import { ReactNode, FC, useEffect } from 'react'
import { ErrType, Result, tryCatch } from '../../types/Result'
import { skipToken, useQuery } from '@tanstack/react-query'
import { applicationStore } from '../(stores)/applicationStore'



type NonNullableElements<T> = T extends any[] ? {
    [Idx in keyof T]: NonNullable<T[Idx]>
} : never
export const useOperation = <
    OperationKey extends string,
    T,
    ErrorType extends string,
    ErrorInfo extends Record<string, any>,
    Dependencies extends readonly any[]
>({
    operationKey,
    tryOp,
    catchOp,
    finallyOp,
    render,
    dependencies
}: {
    operationKey: OperationKey
    tryOp: (dependencies: NonNullableElements<Dependencies>) => Promise<T> | T,
    catchOp: (error: any, dependencies: NonNullableElements<Dependencies>) => Result<never, ErrType<ErrorType, ErrorInfo>>,
    finallyOp?: (dependencies: NonNullableElements<Dependencies>) => void,
    render: {
        Success: FC<{ data: T, dependencies: Dependencies }>
        Pending: FC<{ dependencies: Dependencies }>
        Error: FC<{ error: ErrType<ErrorType, ErrorInfo>, dependencies: Dependencies }>
    }
    dependencies: Dependencies
}) => {
    const { data: result } = useQuery({
        queryKey: [operationKey],
        queryFn: dependencies.length === 0
            ? async () => await tryCatch({
                try: () => tryOp(dependencies as NonNullableElements<Dependencies>),
                catch: (error) => catchOp(error, dependencies as NonNullableElements<Dependencies>),
                finally: () => finallyOp?.(dependencies as NonNullableElements<Dependencies>)
            })
            : dependencies.every(dependency => (!!dependency))
                ? async () => await tryCatch({
                    try: () => tryOp(dependencies as NonNullableElements<Dependencies>),
                    catch: (error) => catchOp(error, dependencies as NonNullableElements<Dependencies>),
                    finally: () => finallyOp?.(dependencies as NonNullableElements<Dependencies>)
                })
                : skipToken
    })
    useEffect(() => {
        if (!result) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, {
                    Component: () => render.Pending({ dependencies }),
                    operationState: 'pending'
                })
            })
            return
        }
        const { error, data } = result
        if (error) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, {
                    Component: () => render.Error({ error, dependencies }),
                    operationState: 'error'
                })
            })
            return
        }
        if (data) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, {
                    Component: () => render.Success({ data, dependencies }),
                    operationState: 'success'
                })
            })
        }
    }, [result])
    return result?.data
}