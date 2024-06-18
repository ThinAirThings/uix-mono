



export const useUixTemplate = () => /* ts */`
import {
    getUniqueChildNode, 
    getChildNodeSet, 
    getAllOfNodeType, 
    getVectorNodeByKey, 
    getNodeByKey
} from './functionModule'

const fnMap = {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey
} as const

export const useUix = <
    QueryType extends keyof typeof fnMap,
>(
    queryType: QueryType
) => {

}
`