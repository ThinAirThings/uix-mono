import { Project, VariableDeclarationKind } from "ts-morph";
import { GenericUixConfig } from "../../../config/defineConfig";
import path from 'path';
// Function to generate the module file content
export const generateFunctionModuleFile = async (config: GenericUixConfig) => {
    console.log(config.outdir)
    const project = new Project({ compilerOptions: { outDir: "dist" } });
    const sourceFile = project.createSourceFile(
        path.join(process.cwd(), config.outdir, "functionModule.ts"),
        "",
        { overwrite: true }
    );

    // Add import declarations
    sourceFile.addImportDeclaration({
        moduleSpecifier: config.pathToConfig.replace('uix.config.ts', 'uix.config'),
        defaultImport: 'uixConfig'
    });
    // Import uix factory functions
    sourceFile.addImportDeclaration({
        moduleSpecifier: "@thinairthings/uix",
        namedImports: ["createNodeFactory", "updateNodeFactory", "deleteNodeFactory", "getNodeByKeyFactory"]
    });
    // Import neo4j and openai
    sourceFile.addImportDeclaration({
        moduleSpecifier: "neo4j-driver",
        defaultImport: "neo4j"
    });
    sourceFile.addImportDeclaration({
        moduleSpecifier: "openai",
        defaultImport: "OpenAI"
    })

    // Add driver initialization
    sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
            name: "driver",
            initializer: /*typescript*/`neo4j.driver(
                uixConfig.neo4jConfig.uri,
                neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
            )`
        }]
    });
    // Add OpenAI Initialization
    sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
            name: "openaiClient",
            initializer: /*typescript*/`new OpenAI({
                apiKey: uixConfig.openaiConfig.apiKey
            })`
        }]
    });
    // Add function exports
    const functions = ["createNode", "updateNode", "deleteNode", "getNodeByKey"];
    const factories = ["createNodeFactory", "updateNodeFactory", "deleteNodeFactory", "getNodeByKeyFactory"];

    functions.forEach((func, index) => {
        sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [{
                name: func,
                initializer: `${factories[index]}(driver, uixConfig.graph.nodeTypeMap)`
            }],
            isExported: true,

        });
    });

    // Optional: Add a comment at the end
    sourceFile.addStatements("// Hello");

    // Save the generated file (this is an asynchronous operation)
    await sourceFile.save()
};