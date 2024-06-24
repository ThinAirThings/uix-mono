import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";


// this node exists for testing purposes only
export const DummyNodeDefinition = defineNodeType('Dummy', z.object({
    name: z.string()
}))
