import React, { useMemo } from 'react';
import { codegenStore } from '../codegen';
import { Text } from 'ink';
import neo4j, { Neo4jError } from 'neo4j-driver';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '../../(components)/Loading';
import { useStore } from 'zustand';
import { BasicErr, tryCatch } from '../../../types/Result';

export const SeedNeo4j = () => {
    const uixConfig = useStore(codegenStore, (store) => store.uixConfig)
    if (!uixConfig) return <Text color="red">UixConfig not found</Text>
    const neo4jDriver = useMemo(() => neo4j.driver(
        uixConfig.neo4jConfig.uri,
        neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
    ), [])
    const { data: seedResult, error: seedError } = useQuery({
        queryKey: ['seedNeo4j'],
        queryFn: async () => {
            // Create Null Node
            await neo4jDriver.executeQuery(/*cypher*/`
                MERGE (nullNode:Node:Null {nodeId: '0'})
                ON CREATE SET nullNode.createdAt = datetime()
            `)
            // Create Unique Indexes
            const uniqueIndexResults = await Promise.all(uixConfig.graph.nodeTypeSet.map(nodeDefinition =>
                nodeDefinition.uniqueIndexes.map(async index =>
                    tryCatch({
                        try: async () => await neo4jDriver.executeQuery(/*cypher*/`
                            CREATE CONSTRAINT ${nodeDefinition.type}_${index}_index IF NOT EXISTS
                            FOR (node:${nodeDefinition.type})
                            REQUIRE node.${index} IS UNIQUE
                        `),
                        catch: (error: Error) => BasicErr({
                            code: 'Neo4jConstraintCreationFailed',
                            message: `Failed to create unique constraint for ${nodeDefinition.type}.${index}: ${error.message}`
                        })
                    })
                )
            ).flat())
            neo4jDriver.close()
            return true
        }
    })
    if (seedError) return <Text color="red">Error seeding Neo4j: {seedError.message}</Text>
    if (!seedResult) return <Loading text="Seeding neo4j..." />
    return (<>
        <Text>✅ Neo4j seeded successfully</Text>
        <Text>🚀 Success</Text>
    </>)
}