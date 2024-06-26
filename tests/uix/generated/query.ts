
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    UniqueChildNodeTypes,
    UniqueParentTypes,
    NodeKey,
    NodeShape,
    NodeState
} from '@thinairthings/uix'
import {
    ConfiguredNodeTypeMap
} from './staticObjects'
import {
    UniqueChildQueryOptions
} from './queryOptions'
import { produce } from 'immer'
import { updateNode } from './functionModule'
import { useEffect, useRef } from 'react'

export const useUniqueChild = <
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
    Data = NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>,
>(
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>) => Data
) => {
    const queryOptions = UniqueChildQueryOptions(parentNodeKey, childNodeType, select)
    const queryClient = useQueryClient()
    const { data, error } = useQuery(queryOptions)
    const setData = (newData: NodeState<ConfiguredNodeTypeMap[ChildNodeType]>) => {
        queryClient.setQueryData(queryOptions.queryKey, oldData => {
            if (!oldData) return
            return produce(oldData, draft => {
                Object.assign(draft, newData)
            })
        })
    }
    const updateMutation = useMutation({
        mutationFn: async (inputData: Partial<NodeState<ConfiguredNodeTypeMap[ChildNodeType]>>) => {
            const currentNodeData = queryClient.getQueryData(queryOptions.queryKey)
            if (!currentNodeData) return
            console.log("Running Mutation: ", 'updateNode({ nodeType: ' + currentNodeData.nodeType + 'nodeId: ' + currentNodeData.nodeId + inputData)
            return await updateNode({ nodeType: currentNodeData.nodeType, nodeId: currentNodeData.nodeId }, inputData)
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: queryOptions.queryKey })
            const previousData = queryClient.getQueryData(queryOptions.queryKey)
            queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
                if (!oldData) return
                return produce(oldData, draftData => {
                    Object.assign(draftData, data)
                })
            })
            return { previousData }
        },
        onError: (err, newData, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.previousData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryOptions.queryKey
            })
        }
    })
    const useMutateOnDismount = () => {
        const initialDataRef = useRef(queryClient.getQueryData(queryOptions.queryKey))
        useEffect(() => {
            queryClient.setQueryDefaults(queryOptions.queryKey, { enabled: false })
            return () => {
                const didChange = !initialDataRef.current || initialDataRef.current !== produce(initialDataRef.current, draftData => {
                    Object.assign(draftData, queryClient.getQueryData(queryOptions.queryKey))
                })
                didChange && updateMutation.mutate(queryClient.getQueryData(queryOptions.queryKey)!, {
                    onSettled: () => queryClient.setQueryDefaults(queryOptions.queryKey, { enabled: true })
                })
            }
        }, [])
    }
    return {
        data,
        error,
        updateMutation,
        setData,
        useMutateOnDismount
    }
}
