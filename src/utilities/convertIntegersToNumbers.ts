import neo4j from "neo4j-driver"
import { AnyNeo4jNodeShape, AnyNodeShape, AnyNodeType, GenericNeo4jNodeShape, Neo4jNodeShape, NodeShape } from "../types/NodeType"




export const convertIntegersToNumbers = <
    I
>(
    neo4jNodeShape: I
) => {
    return Object.entries(<GenericNeo4jNodeShape>neo4jNodeShape).reduce((acc, [key, value]) => {
        if (value instanceof neo4j.types.Integer) {
            acc[key] = value.toNumber()
        } else {
            acc[key] = value
        }
        return acc
    }, {} as I) as I
}