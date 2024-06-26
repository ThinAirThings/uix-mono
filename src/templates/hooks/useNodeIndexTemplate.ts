import { singleNodeTemplate } from "../singleNodeTemplate";



export const useNodeIndexTemplate = () => /*ts*/`
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
    ${singleNodeTemplate(false)}
}
`