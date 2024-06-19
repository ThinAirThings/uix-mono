
import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'
import {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey,
    ConfiguredNodeTypeMap
} from '../uix/generated/functionModule'
import { UniqueChildNodeTypes, UniqueParentTypes, NodeKey, NodeShape, NodeSetParentTypes, NodeSetChildNodeTypes, AnyResult, ParentOfNodeSetTypes } from '@thinairthings/uix'



type GetAllOfNodeTypeGraphQueryOption<
    NodeType extends keyof ConfiguredNodeTypeMap
> = {
    type: 'getAllOfNodeType'
    nodeType: NodeType
}

type GetNodeByKeyGraphQueryOption<
    NodeType extends keyof ConfiguredNodeTypeMap
> = {
    type: 'getNodeByKey'
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>
}

type GetUniqueChildGraphQueryOption<
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
> = {
    type: 'getUniqueChild'
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>
    childNodeType: ChildNodeType
}

type GetChildNodeSetGraphQueryOption<
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
> = {
    type: 'getChildNodeSet'
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>
    childNodeType: ChildNodeType
}

type GraphQueryOptions<
    T extends 'getAllOfNodeType' | 'getNodeByKey' | 'getUniqueChild' | 'getChildNodeSet'
> = T extends 'getAllOfNodeType' ? GetAllOfNodeTypeGraphQueryOption<keyof ConfiguredNodeTypeMap> :
    T extends 'getNodeByKey' ? GetNodeByKeyGraphQueryOption<keyof ConfiguredNodeTypeMap> :
    T extends 'getUniqueChild' ? GetUniqueChildGraphQueryOption<UniqueParentTypes<ConfiguredNodeTypeMap>, UniqueChildNodeTypes<ConfiguredNodeTypeMap, UniqueParentTypes<ConfiguredNodeTypeMap>>> :
    T extends 'getChildNodeSet' ? GetChildNodeSetGraphQueryOption<NodeSetParentTypes<ConfiguredNodeTypeMap>, NodeSetChildNodeTypes<ConfiguredNodeTypeMap, NodeSetParentTypes<ConfiguredNodeTypeMap>>> :
    never
export const graphQueryOptions = () => {

}