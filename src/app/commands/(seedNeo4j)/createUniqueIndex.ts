import { Driver } from "neo4j-driver";



export const createUniqueIndex = async ({
    driver,
    nodeType,
    propertyName
}: {
    driver: Driver,
    nodeType: Capitalize<string>
    propertyName: string
}) => {
    await driver.executeQuery(/*cypher*/`
        CREATE CONSTRAINT ${nodeType}_${propertyName}_index IF NOT EXISTS
        FOR (node:${nodeType})
        REQUIRE node.${propertyName} IS UNIQUE
    `)
}