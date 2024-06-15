import React, { useMemo } from 'react';
import { Text } from 'ink';
import { Loading } from '../../(components)/Loading';
import { UixErr, UixErrCode } from '../../../types/Result';
import { useOperation } from '../../(hooks)/useOperation';
import { useApplicationStore } from '../../(stores)/applicationStore';
import { createNeo4jClient } from '../../../clients/neo4j';
import { CreateUniqueIndex } from './CreateUniqueIndex';
import { CreatePropertyVector } from './CreatePropertyVector';
import { CreateNodeTypeVector } from './CreateNodeTypeVector';

export const SeedNeo4j = () => {
    const uixConfig = useApplicationStore(state => state.uixConfig)
    const neo4jDriver = useMemo(() => uixConfig && createNeo4jClient(uixConfig.neo4jConfig), [uixConfig])
    useOperation({
        dependencies: [neo4jDriver],
        operationKey: 'createNullNode',
        tryOp: async ([neo4jDriver]) => {
            // Create Null Node
            await neo4jDriver.executeQuery(/*cypher*/`
                MERGE (nullNode:Node:Null {nodeId: '0'})
                ON CREATE SET nullNode.createdAt = datetime()
            `)
            return true
        },
        catchOp: (error: any) => UixErr({
            code: UixErrCode.CREATE_NULL_NODE_FAILED,
            message: `Failed to create Null node: ${error.message}`
        }),
        finallyOp: async ([neo4jDriver]) => await neo4jDriver.close(),
        render: {
            Success: () => <Text>✅ Null node created.</Text>,
            Pending: () => <Loading text="Creating null node..." />,
            Error: ({ error }) => <Text color="red">Error creating null node: {error.message}</Text>
        }
    })
    if (!uixConfig) return <></>
    return (<>
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.nodeTypeVectorDescription && <CreateNodeTypeVector nodeType={NodeType.type} />
        )}
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