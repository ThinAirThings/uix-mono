import { useOperation } from "../../(hooks)/useOperation"
import React, { FC, useMemo } from 'react'
import { useApplicationStore } from "../../(stores)/applicationStore"
import { Loading } from "../../(components)/Loading"
import { UixErr, UixErrSubtype } from "../../../types/Result"
import { Neo4jError } from "neo4j-driver"
import { Error } from "../../(components)/Error"
import { Success } from "../../(components)/Success"

export const CreatePropertyVector: FC<{
    nodeType: Capitalize<string>,
    propertyName: string
}> = ({
    nodeType,
    propertyName
}) => {
        const neo4jDriver = useApplicationStore(state => state.neo4jDriver)
        useOperation({
            dependencies: [neo4jDriver],
            operationKey: `createPropertyVector-${nodeType}-${propertyName}`,
            tryOp: async ([neo4jDriver]) => {
                await neo4jDriver.executeQuery(/*cypher*/`
                    CREATE VECTOR INDEX ${nodeType}_${propertyName}_vector IF NOT EXISTS
                    FOR (vectorNode:${nodeType}Vector)
                    ON (vectorNode.${propertyName})
                    OPTIONS {indexConfig: {
                        \`vector.dimensions\`: 3072,
                        \`vector.similarity_function\`: "cosine"
                    }}
                `)
                return true
            },
            catchOp: (error: Neo4jError) => {
                return UixErr({
                    subtype: UixErrSubtype.CREATE_PROPERTY_VECTOR_FAILED,
                    message: `Failed to create property vector for ${nodeType}.${propertyName}: ${error.message}`,
                    data: {
                        neo4jErrorType: error.name,
                        nodeType: nodeType,
                        propertyName
                    }
                })
            },
            render: {
                Success: () => <Success message={`Successfully created property vector for ${nodeType}Node on property ${propertyName}`} />,
                Pending: () => <Loading text={`Creating property vector for ${nodeType}`} />,
                Error: ({ error }) => (
                    <Error
                        message={`Property Vector creation failed for: ${nodeType}Node.${propertyName}`}
                        isBugReport={true}
                        error={error}
                    />
                )
            },
        })
        return <></>
    }