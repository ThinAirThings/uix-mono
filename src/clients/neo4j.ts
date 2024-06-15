import neo4j from 'neo4j-driver';
import { Neo4jError } from "neo4j-driver"
import { AnyResult, Err } from '../types/Result';


export const createNeo4jClient = (config: {
    uri: string
    username: string
    password: string
}) => neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password))

export const neo4jAction = <
    Input extends any[],
    Output extends AnyResult
>(
    fn: (...args: Input) => Promise<Output>
) => async (
    ...args: Input
) => {
        try {
            return await fn(...args)
        } catch (e) {
            if (!(e instanceof Neo4jError)) throw e
            return Neo4jErr(e)
        }
    }

export const Neo4jErr = (error: Neo4jError) => Err('Neo4jErr', error)