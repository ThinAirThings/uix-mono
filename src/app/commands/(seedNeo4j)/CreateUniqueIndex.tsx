import { useOperation } from "../../(hooks)/useOperation"
import React, { FC, useMemo } from 'react'
import { createNeo4jClient } from "../../../clients/neo4j"
import { useApplicationStore } from "../../(stores)/applicationStore"
import { Loading } from "../../(components)/Loading"
import { Text, Box } from 'ink'
import { UixErr, UixErrCode } from "../../../types/Result"
import { Error } from "../../(components)/Error"

export const CreateUniqueIndex: FC<{
    nodeType: Capitalize<string>,
    propertyName: string
}> = ({
    nodeType,
    propertyName
}) => {
        const uixConfig = useApplicationStore(state => state.uixConfig)
        const neo4jDriver = useMemo(() => uixConfig && createNeo4jClient(uixConfig.neo4jConfig), [uixConfig])
        const createUniqueIndexResult = useOperation({
            dependencies: [neo4jDriver],
            operationKey: `createUniqueIndex-${nodeType}-${propertyName}`,
            tryOp: async ([neo4jDriver]) => {
                await neo4jDriver.executeQuery(/*cypher*/`
                CREATE CONSTRAINT ${nodeType}_${propertyName}_index IF NOT EXISTS
                FOR (node:${nodeType})
                REQUIRE node.${propertyName} IS UNIQUE
            `)
                return true
            },
            catchOp: (error: Error) => UixErr({
                code: UixErrCode.CREATE_UNIQUE_INDEX_FAILED,
                message: `Failed to create unique constraint for ${nodeType}.${propertyName}: ${error.message}`,
                data: {
                    neo4jErrorType: error.name,
                    nodeType: nodeType,
                    propertyName
                }
            }),
            finallyOp: async ([neo4jDriver]) => await neo4jDriver.close(),
            render: {
                Success: ({ data }) => <Text>✅ Successfully created unique index for {nodeType}Node on property {propertyName}</Text>,
                Pending: () => <Loading text={`Creating unique index for ${nodeType}`} />,
                Error: ({ error }) => (
                    <Error
                        message={`Unique index creation failed for: ${error.data.nodeType}Node`}
                        isBugReport={true}
                        error={error}
                    />
                )
            },
        })
        // This signals a leaf
        return <></>
    }