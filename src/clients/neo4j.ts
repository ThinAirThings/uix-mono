import neo4j from 'neo4j-driver';
import { Neo4jError } from "neo4j-driver"
import { AnyResult, Neo4jErr } from '../types/Result';


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
        } catch (_e) {
            const e = _e as Neo4jError
            return Neo4jErr(e)
        }
    }