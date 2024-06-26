
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NodeIndexQueryOptions } from "./queryOptions";
import { ConfiguredNodeTypeMap } from "./staticObjects";
import { NodeShape, NodeState } from '@thinairthings/uix'
import { produce, Draft } from "immer";
import { updateNode, deleteNode } from "./functionModule";
import { useEffect, useRef } from "react";

export const useNodeIndex = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    UniqueIndex extends ConfiguredNodeTypeMap[NodeType]['uniqueIndexes'][number],
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>,
>({
    nodeType,
    indexKey,
    indexValue,
    select
}:{    
    nodeType: NodeType,
    indexKey: UniqueIndex,
    indexValue: string,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>) => Data
}) => {
    const queryClient = useQueryClient()
    const queryOptions = NodeIndexQueryOptions({nodeType, indexKey, indexValue, select})
    const { data, error } = useQuery(queryOptions)
    
    const setData = (
        newData: 
        | Partial<NodeState<ConfiguredNodeTypeMap[NodeType]>> 
        | ((draft: Draft<NodeState<ConfiguredNodeTypeMap[NodeType]>>) => void)
    ) => {
        if (typeof newData === 'function') {
            queryClient.setQueryData(queryOptions.queryKey, oldData => produce(oldData, newData))
        } else {
            queryClient.setQueryData(queryOptions.queryKey, oldData => {
                if (!oldData) return
                return produce(oldData, draft => {
                    Object.assign(draft, newData)
                })
            })
        }
    }
    const updateMutation = useMutation({
        mutationFn: async (inputData: Partial<NodeState<ConfiguredNodeTypeMap[NodeType]>>) => {
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
