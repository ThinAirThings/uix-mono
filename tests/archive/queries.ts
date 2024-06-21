
import { queryOptions, useQuery } from '@tanstack/react-query'
import {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey,
    ConfiguredNodeTypeMap,
    getNodeByIndex
} from '../uix/generated/functionModule'
import { UniqueChildNodeTypes, UniqueParentTypes, NodeKey, NodeShape, NodeSetParentTypes, NodeSetChildNodeTypes, AnyResult, ParentOfNodeSetTypes, AnyRelationshipTypeSet, GenericRelationshipType, AnyRelationshipType, VectorKeys } from '@thinairthings/uix'
import uixConfig from '../uix/uix.config.js'
// Unique Child Query
export const UniqueChildQuery = <
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
>(
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType
) => queryOptions({
    queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
    queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
        const result = await getUniqueChildNode({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})

export const NodeSetQuery = <
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
>(
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType
) => queryOptions({
    queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
    queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
        const result = await getChildNodeSet({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})

export const AllOfNodeTypeQuery = <
    NodeType extends keyof ConfiguredNodeTypeMap
>(
    nodeType: NodeType
) => queryOptions({
    queryKey: [nodeType] as const,
    queryFn: async ({ queryKey: [nodeType] }) => {
        const result = await getAllOfNodeType(nodeType)
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})

export const NodeByKeyQuery = <
    NodeType extends keyof ConfiguredNodeTypeMap
>(
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>
) => queryOptions({
    queryKey: [nodeKey.nodeType, nodeKey.nodeId] as const,
    queryFn: async ({ queryKey: [nodeType, nodeId] }) => {
        const result = await getNodeByKey({ nodeType, nodeId })
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})

export const VectorNodeByKeyQuery = <
    NodeType extends VectorKeys<ConfiguredNodeTypeMap>,
>(
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>
) => queryOptions({
    queryKey: [nodeKey.nodeType, nodeKey.nodeId] as const,
    queryFn: async ({ queryKey: [nodeType, nodeId] }) => {
        const result = await getVectorNodeByKey({ nodeType, nodeId })
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})


export const NodeByIndexQuery = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    UniqueIndex extends ConfiguredNodeTypeMap[NodeType]['uniqueIndexes'][number],
>(
    nodeType: NodeType,
    indexKey: UniqueIndex,
    indexValue: string
) => queryOptions({
    queryKey: [nodeType, indexKey, indexValue] as const,
    queryFn: async ({ queryKey: [nodeType, indexKey, indexValue] }) => {
        const result = await getNodeByIndex(nodeType, indexKey, indexValue)
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})


const isUniqueParent = (nodeType: keyof ConfiguredNodeTypeMap): nodeType is UniqueParentTypes<ConfiguredNodeTypeMap> => {
    const relationshipTypeSet = uixConfig.graph.nodeTypeMap[nodeType].relationshipTypeSet
    if (relationshipTypeSet.length === 0) return false
    return relationshipTypeSet.some((rel: GenericRelationshipType) => rel.relationshipClass === 'Unique')
}

const isNodeSetParent = (nodeType: keyof ConfiguredNodeTypeMap): nodeType is NodeSetParentTypes<ConfiguredNodeTypeMap> => {
    const relationshipTypeSet = uixConfig.graph.nodeTypeMap[nodeType].relationshipTypeSet
    if (relationshipTypeSet.length === 0) return false
    return relationshipTypeSet.some((rel: GenericRelationshipType) => rel.relationshipClass === 'Set')
}
const isNodeSetChild = <
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap>,
>(
    parentNodeType: ParentNodeType,
    nodeType: keyof ConfiguredNodeTypeMap
): nodeType is NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType> => {
    const relationshipTypeSet = uixConfig.graph.nodeTypeMap[parentNodeType].relationshipTypeSet
    return relationshipTypeSet.some((rel: GenericRelationshipType) => rel.toNodeType.type === nodeType)
}

export const GlobalQuery = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    NodeId extends string | undefined = undefined,
    ChildNodeType extends (NodeSetChildNodeTypes<ConfiguredNodeTypeMap, NodeType> | UniqueChildNodeTypes<ConfiguredNodeTypeMap, NodeType>) | undefined = undefined,
>({
    nodeType,
    nodeId,
    childNodeType
}: {
    nodeType: NodeType,
    nodeId?: NodeId,
    childNodeType?: ChildNodeType,
}) => {
    if (!nodeId) {
        return AllOfNodeTypeQuery(nodeType)
    }
    if (nodeId) {
        return NodeByKeyQuery({ nodeType, nodeId })
    }
    if (childNodeType && isNodeSetParent(nodeType) && isNodeSetChild(nodeType, childNodeType)) {
        return NodeSetQuery({ nodeType, nodeId }, childNodeType)
    }
}




useQuery(GlobalQuery({
    nodeType: 'User',
    nodeId: '',
    childNodeType: ''
}))