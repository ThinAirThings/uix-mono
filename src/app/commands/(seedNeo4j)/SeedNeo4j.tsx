import React, { useMemo } from 'react';
import { Text } from 'ink';
import { Loading } from '../../(components)/Loading';
import { UixErr, UixErrSubtype } from '../../../types/Result';
import { useOperation } from '../../(hooks)/useOperation';
import { useApplicationStore } from '../../(stores)/applicationStore';
import { CreateUniqueIndex } from './CreateUniqueIndex';
import { CreatePropertyVector } from './CreatePropertyVector';
import { CreateNodeTypeVector } from './CreateNodeTypeVector';
import { Neo4jError } from 'neo4j-driver';

export const SeedNeo4j = () => {
    const uixConfig = useApplicationStore(state => state.uixConfig)
    const neo4jDriver = useApplicationStore(state => state.neo4jDriver)
    useOperation({
        dependencies: [neo4jDriver, uixConfig] as const,
        operationKey: 'createNullNode',
        tryOp: async ([neo4jDriver, uixConfig]) => {
            // Create Null Node
            uixConfig.graph.nodeTypeMap['Null']
                || uixConfig.graph.nodeTypeMap['Root']
                && await neo4jDriver.executeQuery(/*cypher*/`
                    MERGE (nullNode:Node:Null {nodeId: '0'})
                    ON CREATE SET nullNode.createdAt = datetime()
                    WITH nullNode
                    WHERE NOT 'Root' IN labels(nullNode)
                    SET nullNode:Root
                    RETURN nullNode
            `)
            // Add timestamp indexes for sorting
            await neo4jDriver.executeQuery(/*cypher*/`
                CREATE INDEX node_created_at IF NOT EXISTS FOR (node:Node) ON (node.createdAt);
            `)
            await neo4jDriver.executeQuery(/*cypher*/`
                CREATE INDEX node_updated_at IF NOT EXISTS FOR (node:Node) ON (node.updatedAt);
            `)
            console.log("DONE")
            return true
        },
        catchOp: (error: Neo4jError) => UixErr({
            subtype: UixErrSubtype.CREATE_NULL_NODE_FAILED,
            message: `Failed to create Null node: ${error.message}`,
            data: error
        }),
        render: {
            Success: () => <Text>✅ Null node created.</Text>,
            Pending: () => <Loading text="Creating null node..." />,
            Error: ({ error }) => <Text color="red">Error creating null node: {error.data?.message}</Text>
        }
    })
    if (!uixConfig) return <></>
    return (<>
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.nodeTypeVectorDescription
            && <CreateNodeTypeVector
                key={NodeType.type}
                nodeType={NodeType.type}
            />
        )}
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.uniqueIndexes.map(uniqueIndex =>
                <CreateUniqueIndex
                    key={`${NodeType.type}-${uniqueIndex}`}
                    nodeType={NodeType.type}
                    propertyName={uniqueIndex}
                />
            )
        )}
        {uixConfig.graph.nodeTypeSet.map(NodeType =>
            NodeType.propertyVectors.map(propertyVector =>
                <CreatePropertyVector
                    key={`${NodeType.type}-${propertyVector}`}
                    nodeType={NodeType.type}
                    propertyName={propertyVector}
                />
            )
        )}
    </>)
}