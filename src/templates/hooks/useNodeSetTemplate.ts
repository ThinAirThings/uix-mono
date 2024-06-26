

export const useNodeSetTemplate = () => /*ts*/`
import {
    NodeKey,
    NodeSetParentTypes,
    NodeSetChildNodeTypes,
    NodeShape,
    NodeState
} from '@thinairthings/uix'
import { ConfiguredNodeTypeMap } from './staticObjects'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NodeSetQueryOptions } from './queryOptions'
import { createNode } from './functionModule'


export const useNodeSet = <
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
    Data = NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>[],
>({
    parentNodeKey,
    childNodeType,
    select
}:{    
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>[]) => Data
}) => {
    const queryOptions = NodeSetQueryOptions({parentNodeKey, childNodeType, select})
    const queryClient = useQueryClient()
    const { data, error } = useQuery(queryOptions)
    const createNodeMutation = useMutation({
        mutationFn: async (initialState: NodeState<ConfiguredNodeTypeMap[ChildNodeType]>) => {
            return await createNode([parentNodeKey], childNodeType, initialState)
        },
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType]
        })
    })
    return { data, error, createNodeMutation }
}
`