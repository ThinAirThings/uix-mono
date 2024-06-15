
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
    render,
    dependencies
}: {
    operationKey: OperationKey
    tryOp: (dependencies: NonNullableElements<Dependencies>) => Promise<T> | T,
    catchOp: (error: any) => Result<never, ErrType<ErrorType, ErrorInfo>>
    render: {
        success: FC
        pending: FC
        error: FC
    }
    dependencies: Dependencies
}) => {
    const { data: result } = useQuery({
        queryKey: [operationKey],
        queryFn: dependencies.length === 0
            ? async () => await tryCatch({
                try: () => tryOp(dependencies as NonNullableElements<Dependencies>),
                catch: catchOp
            })
            : dependencies.every(dependency => (!!dependency))
                ? async () => await tryCatch({
                    try: () => tryOp(dependencies as NonNullableElements<Dependencies>),
                    catch: catchOp
                })
                : skipToken
    })
    useEffect(() => {
        if (!result) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, render.pending)
            })
            return
        }
        if (result.error) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, render.error)
            })
            return
        }
        if (result.data) {
            applicationStore.setState(({ outputMap }) => {
                outputMap.set(operationKey, render.success)
            })
        }
    }, [result])
    return result?.data
}