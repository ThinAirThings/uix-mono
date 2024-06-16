import { parseEnv } from "znv";
import { z } from "zod";



export const {
    NEO4J_URI_LOCAL,
    NEO4J_USERNAME_LOCAL,
    NEO4J_PASSWORD_LOCAL,
    OPENAI_API_KEY,
} = parseEnv(process.env, {
    NEO4J_URI_LOCAL: z.string().default('bolt://localhost:7687'),
    NEO4J_USERNAME_LOCAL: z.string().default('neo4j'),
    NEO4J_PASSWORD_LOCAL: z.string().default('testpassword'),
    OPENAI_API_KEY: z.string()
});