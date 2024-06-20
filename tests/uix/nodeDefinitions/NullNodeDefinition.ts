
import { z } from "zod";
import { UserNodeDefinition } from "./UserNodeDefinition"
import { defineNodeType } from "@thinairthings/uix";

export const NullNodeDefinition = defineNodeType('Null', z.object({}))
    .defineNodeSetRelationship(UserNodeDefinition)