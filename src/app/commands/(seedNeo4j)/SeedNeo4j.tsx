import React, { useMemo } from 'react';
import { Text } from 'ink';
import { Loading } from '../../(components)/Loading';
import { UixErr, UixErrCode } from '../../../types/Result';
import { useOperation } from '../../(hooks)/useOperation';
import { useApplicationStore } from '../../(stores)/applicationStore';
import { createNeo4jClient } from '../../../clients/neo4j';
import { CreateUniqueIndex } from './CreateUniqueIndex';
import { CreatePropertyVector } from './CreatePropertyVector';

export const SeedNeo4j = () => {
    const uixConfig = useApplicationStore(state => state.uixConfig)
    useOperation({
        dependencies: [uixConfig],
        operationKey: 'createNullNode',
        tryOp: async ([uixConfig]) => {
            const neo4jDriver = createNeo4jClient(uixConfig.neo4jConfig)
            // Create Null Node
            await neo4jDriver.executeQuery(/*cypher*/`
                MERGE (nullNode:Node:Null {nodeId: '0'})
                ON CREATE SET nullNode.createdAt = datetime()
            `)
            neo4jDriver.close()
            return true
        },
        catchOp: (error: any) => UixErr({
            code: UixErrCode.CREATE_NULL_NODE_FAILED,
            message: `Failed to create Null node: ${error.message}`
        }),
        render: {
            Success: () => <Text>✅ Null node created.</Text>,
            Pending: () => <Loading text="Creating null node..." />,
            Error: ({ error }) => <Text color="red">Error creating null node: {error.message}</Text>
        }
    })
    if (!uixConfig) return <></>
    return (<>
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.uniqueIndexes.map(uniqueIndex =>
                <CreateUniqueIndex
                    nodeType={NodeType.type}
                    propertyName={uniqueIndex}
                />
            )
        )}
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.propertyVectors.map(propertyVector =>
                <CreatePropertyVector
                    nodeType={NodeType.type}
                    propertyName={propertyVector}
                />
            )
        )}
    </>)
}