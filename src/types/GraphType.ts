import { TypeOf } from 'zod'
import neo4j, { Driver, EagerResult, Integer, Neo4jError, Node, Relationship } from 'neo4j-driver';
import { AnyNodeTypeSet, GenericNodeTypeSet, NodeTypeMap } from './NodeType';
import { createNodeFactory } from '../fns/createNodeFactory';
//  _   _ _   _ _ _ _          _____                  
// | | | | |_(_) (_) |_ _  _  |_   _|  _ _ __  ___ ___
// | |_| |  _| | | |  _| || |   | || || | '_ \/ -_|_-<
//  \___/ \__|_|_|_|\__|\_, |   |_| \_, | .__/\___/__/
//                      |__/        |__/|_|      
export type AnyGraphType = GraphType<any, any>
export type GenericGraphType = GraphType<
    Capitalize<string>,
    GenericNodeTypeSet
>

//  ___       __ _      _ _   _          
// |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  
// | |) / -_)  _| | ' \| |  _| / _ \ ' \ 
// |___/\___|_| |_|_||_|_|\__|_\___/_||_| 
export class GraphType<
    Type extends Capitalize<string> = Capitalize<string>,
    NodeTypeSet extends AnyNodeTypeSet = GenericNodeTypeSet,
> {
    //      ___             _               _           
    //     / __|___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
    //    | (__/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
    //     \___\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  
    constructor(
        public type: Type,
        public nodeTypeSet: NodeTypeSet,
        public nodeTypeMap: NodeTypeMap<NodeTypeSet> = Object.fromEntries(
            this.nodeTypeSet.map(nodeType => [nodeType.type, nodeType])
        ),
    ) { }

    //  ___        _           _        
    // | __|_ _ __| |_ ___ _ _(_)___ ___
    // | _/ _` / _|  _/ _ \ '_| / -_|_-<
    // |_|\__,_\__|\__\___/_| |_\___/__/

}
//  ___       __ _                 
// |   \ ___ / _(_)_ _  ___ _ _ ___
// | |) / -_)  _| | ' \/ -_) '_(_-<
// |___/\___|_| |_|_||_\___|_| /__/
export const defineGraphType = <
    Type extends Capitalize<string>,
    NodeTypeSet extends AnyNodeTypeSet,
>(
    type: Type,
    nodeTypeSet: NodeTypeSet,
) => {
    return new GraphType(
        type,
        nodeTypeSet,
    )
}

