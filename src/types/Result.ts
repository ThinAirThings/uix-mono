import { Neo4jError } from "neo4j-driver"

//  ___             _ _   
// | _ \___ ____  _| | |_ 
// |   / -_|_-< || | |  _|
// |_|_\___/__/\_,_|_|\__|
export type AnyResult = Result<any, any>
export type Result<T, E extends AnyErrType> = {
    data: T
    error: null
} | {
    data: null
    error: E
}


//  _____          ___      _      _    
// |_   _| _ _  _ / __|__ _| |_ __| |_  
//   | || '_| || | (__/ _` |  _/ _| ' \ 
//   |_||_|  \_, |\___\__,_|\__\__|_||_|
//           |__/                       
export const tryCatch = async <
    T,
    ErrorType extends string,
    ErrorInfo extends Record<string, any>,
>(opts: {
    try: () => Promise<T> | T,
    catch: (error: any) => Result<never, ErrType<ErrorType, ErrorInfo>>
}): Promise<Result<T, ErrType<ErrorType, ErrorInfo>>> => {
    try {
        return Ok(await opts.try())
    } catch (error) {
        return opts.catch(error)
    }
}

//  ___  _   
// / _ \| |__
// | (_) | / /
// \___/|_\_\
export const Ok = <T>(data: T): Result<T, never> => ({
    data,
    error: null,
})


export type AnyErrType = ErrType<any, any>
export type ErrType<
    T extends string,
    E extends Record<string, any>
> = {
    type: T
} & Omit<E, 'type'>

//  ___         
// | __|_ _ _ _ 
// | _|| '_| '_|
// |___|_| |_|  

export const Err = <
    Type extends string,
    Info extends Record<string, any>
>(type: Type, info: Info): Result<never, ErrType<Type, Info>> => {
    console.error({ type, ...info })
    return {
        data: null,
        error: {
            type,
            ...info
        }
    }
}

export enum UixErrCode {
    // Application Errors
    UIX_CONFIG_NOT_FOUND = 'UIX_CONFIG_NOT_FOUND',
    CODE_GENERATION_FAILED = 'CODE_GENERATION_FAILED',
    // Index Errors
    CREATE_UNIQUE_INDEX_FAILED = 'CREATE_UNIQUE_INDEX_FAILED',
    CREATE_VECTOR_INDEX_FAILED = 'CREATE_VECTOR_INDEX_FAILED',
    // CRUD Errors
    CREATE_NODE_FAILED = 'CREATE_NODE_FAILED',
    DELETE_NODE_FAILED = 'DELETE_NODE_FAILED',
    UPDATE_NODE_FAILED = 'UPDATE_NODE_FAILED',
    GET_NODE_BY_KEY_FAILED = 'GET_NODE_BY_KEY_FAILED',
}
export const UixErr = <
    Code extends UixErrCode,
    Data extends Record<string, any> | undefined = undefined,
>({
    message,
    code,
    data
}: {
    message: string
    code: Code
    data?: Data
}) => Err('UixErr', {
    message,
    code,
    data: data as Data extends Record<string, any> ? Data : null
})

export const TestErr = (error: Error) => Err('TestErr', error)

export const Neo4jErr = (error: Neo4jError) => Err('Neo4jErr', error)