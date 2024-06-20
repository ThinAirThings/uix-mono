import { execSync } from 'child_process'
import { v4 as uuid } from 'uuid'
import { expect, test } from 'vitest'
import { Err, tryCatch } from '../src/types/Result.js'
import { createNode, deleteNode, getAllOfNodeType, getChildNodeSet, getNodeByIndex, getUniqueChildNode, getVectorNodeByKey, updateNode } from './uix/generated/functionModule.js'

test('Integration test', async () => {
    const { data: uixData, error: uixError } = await tryCatch({
        try: () => execSync('pnpm uix'),
        catch: (e: Error) => Err({
            type: 'TestErr',
            subtype: 'UixError',
            message: e.message,
            data: { e }
        })
    })
    // console.log("HERE!")
    // Create Node
    const { data: userNode, error: createUserNodeError } = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
        email: `${uuid()}@localTest.com`,
        firstName: 'Local',
        lastName: 'Test',
        userType: 'Unspecified',
        completedOnboardingV2: false,
    })
    if (createUserNodeError) {
        console.error(createUserNodeError)
        expect(createUserNodeError).toBeFalsy()
        return
    }
    expect(userNode).toBeTruthy()
    const { data: createdEducationNode, error: createEducationNodeError } = await createNode(
        userNode,
        'Education', {
        school: 'RPI',
        graduationYear: 2022,
        description: 'I studied math',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    if (createEducationNodeError) {
        console.error(createEducationNodeError)
        expect(createEducationNodeError).toBeFalsy()
        return
    }
    expect(createdEducationNode).toBeTruthy()
    const { data: createdEducationVectorNode, error: createEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${createdEducationNode.nodeType}Vector`, nodeId: createdEducationNode.nodeId })
    if (createEducationVectorNodeError) {
        console.error(createEducationVectorNodeError)
        expect(createEducationVectorNodeError).toBeFalsy()
        return
    }
    expect(createdEducationVectorNode).toBeTruthy()

    // Check updates
    const { data: updatedEducationNode, error: updateEducationNodeError } = await updateNode(createdEducationNode, {
        school: 'RPI',
        description: 'I studied Basket weaving',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    if (updateEducationNodeError) {
        console.error(updateEducationNodeError)
        expect(updateEducationNodeError).toBeFalsy()
        return
    }
    expect(updatedEducationNode).toBeTruthy()

    const { data: updatedEducationVectorNode, error: updateEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${updatedEducationNode.nodeType}Vector`, nodeId: updatedEducationNode.nodeId })
    if (updateEducationVectorNodeError) {
        console.error(updateEducationVectorNodeError)
        expect(updateEducationVectorNodeError).toBeFalsy()
        return
    }
    expect(updatedEducationVectorNode).toBeTruthy()
    expect(createdEducationVectorNode.description![0]).not.toEqual(updatedEducationVectorNode.description![0])


    // Check getAllNodeType
    const { data: allEducationNodes, error: getAllEducationNodesError } = await getAllOfNodeType('Education')
    if (getAllEducationNodesError) {
        console.error(getAllEducationNodesError)
        expect(getAllEducationNodesError).toBeFalsy()
        return
    }

    expect(allEducationNodes).toBeTruthy()
    expect(allEducationNodes.length).toBeGreaterThan(0)

    // Check getChildNodeSEt
    const { data: childEducationNodes, error: getChildEducationNodesError } = await getChildNodeSet(userNode, 'Education')
    if (getChildEducationNodesError) {
        console.error(getChildEducationNodesError)
        expect(getChildEducationNodesError).toBeFalsy()
        return
    }
    expect(childEducationNodes).toBeTruthy()
    expect(childEducationNodes.length).toBeGreaterThan(0)
    // childEducationNodes[0] // Type test
    // Check getUniqueChildNode
    const { data: workPreferenceNode, error: getUniqueProfileNodeError } = await getUniqueChildNode(userNode, 'Profile')
    if (getUniqueProfileNodeError) {
        console.error(getUniqueProfileNodeError)
        expect(getUniqueProfileNodeError).toBeFalsy()
        return
    }
    expect(workPreferenceNode).toBeTruthy()

    // Check getNodeByIndex
    const { data: userNodeByIndex, error: getUserNodeByIndexError } = await getNodeByIndex('User', 'email', userNode.email)
    if (getUserNodeByIndexError) {
        console.error(getUserNodeByIndexError)
        expect(getUserNodeByIndexError).toBeFalsy()
        return
    }
    expect(userNodeByIndex).toBeTruthy()
    // Check deleteNode
    const { data: deleted, error: deleteError } = await deleteNode(userNodeByIndex)
    if (deleteError) {
        console.error(deleteError)
        expect(deleteError).toBeFalsy()
        return
    }
    expect(deleted).toBeTruthy()
})

// import { execSync } from 'child_process';
// import { v4 as uuid } from 'uuid';
// import { describe, beforeAll, afterAll, it, expect } from 'vitest';
// import { Err, tryCatch } from '../src/types/Result.js';
// import { NodeShape } from "@thinairthings/uix";
// import {
//     createNode, deleteNode, getAllOfNodeType, getChildNodeSet, getNodeByIndex, getUniqueChildNode, getVectorNodeByKey, updateNode, ConfiguredNodeTypeMap
// } from './uix/generated/functionModule.js';

// describe('Integration test', () => {
//     let userNode: NodeShape<ConfiguredNodeTypeMap['User']>;
//     let createdEducationNode: NodeShape<ConfiguredNodeTypeMap['Education']>;
//     let createdEducationVectorNode: NodeShape<ConfiguredNodeTypeMap['Education']>;
//     beforeAll(async () => {
//         const { error: uixError } = await tryCatch({
//             try: () => execSync('pnpm uix'),
//             catch: (e: Error) => Err({
//                 type: 'TestErr',
//                 subtype: 'UixError',
//                 message: e.message,
//                 data: { e }
//             })
//         });

//         if (uixError) {
//             console.error(uixError);
//             throw new Error('Setup failed');
//         }

//         const { data, error } = await createNode(
//             { nodeType: 'Null', nodeId: '0' },
//             'User',
//             {
//                 email: `${uuid()}@localTest.com`,
//                 firstName: 'Local',
//                 lastName: 'Test',
//                 userType: 'Unspecified',
//                 completedOnboardingV2: false,
//             }
//         );

//         if (error) {
//             console.error(error);
//             throw new Error('Failed to create user node');
//         }

//         userNode = data;
//         expect(userNode).toBeTruthy();
//     });

//     it('should create an education node', async () => {
//         const { data, error } = await createNode(
//             userNode,
//             'Education', {
//             school: 'RPI',
//             graduationYear: 2022,
//             description: 'I studied math',
//             degree: 'Masters',
//             fieldOfStudy: 'Electrical Engineering',
//         });

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         createdEducationNode = data;
//         expect(createdEducationNode).toBeTruthy();
//     });

//     it('should get the vector node by key', async () => {
//         const { data, error } = await getVectorNodeByKey({
//             nodeType: `${createdEducationNode.nodeType}Vector`,
//             nodeId: createdEducationNode.nodeId
//         });

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//     });

//     it('should update the education node', async () => {
//         const { data, error } = await updateNode(createdEducationNode, {
//             school: 'RPI',
//             description: 'I studied Basket weaving',
//             degree: 'Masters',
//             fieldOfStudy: 'Electrical Engineering',
//         });

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }
//         expect(createdEducationVectorNode.description![0]).not.toEqual(updatedEducationVectorNode.description![0])
//         expect(data).toBeTruthy();
//     });

//     it('should fetch all education nodes', async () => {
//         const { data, error } = await getAllOfNodeType('Education');

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//         expect(data.length).toBeGreaterThan(0);
//     });

//     it('should fetch child education nodes', async () => {
//         const { data, error } = await getChildNodeSet(userNode, 'Education');

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//         expect(data.length).toBeGreaterThan(0);
//     });

//     it('should fetch unique child node', async () => {
//         const { data, error } = await getUniqueChildNode(userNode, 'Profile');

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//     });

//     it('should fetch user node by index', async () => {
//         const { data, error } = await getNodeByIndex('User', 'email', userNode.email);

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//     });

//     it('should delete the user node', async () => {
//         const { data, error } = await deleteNode(userNode);

//         if (error) {
//             console.error(error);
//             expect(error).toBeFalsy();
//             return;
//         }

//         expect(data).toBeTruthy();
//     });
// });
