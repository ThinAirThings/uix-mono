import { AnyZodObject, TypeOf, z } from "zod";





export class EventType<
    Type extends Capitalize<string>,
    PayloadSchema extends AnyZodObject,
> {
    //      ___             _               _           
    //     / __|___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
    //    | (__/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
    //     \___\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  
    constructor(
        public type: Type,
        public payloadSchema: PayloadSchema,
        public callback: (payload: TypeOf<PayloadSchema>) => void,
        public shapeSchema = payloadSchema.extend({
            eventId: z.string(),
            eventType: z.literal(type),
            createdAt: z.string(),
        })
    ) { }
}