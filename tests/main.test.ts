import { execSync } from 'child_process'
import { v4 as uuid } from 'uuid'
import { expect, test, describe, it } from 'vitest'
import { Err, tryCatch } from '../src/types/Result.js'
import { createNode, deleteNode, getAllOfNodeType, getChildNodeSet, getNodeByIndex, getUniqueChildNode, getVectorNodeByKey, updateNode } from './uix/generated/functionModule.js'

//https://stackoverflow.com/questions/65148503/jest-tests-show-object-is-possibly-null-errors
// this function exists to make the compiler happy
const assertDefined = <T>(obj: T | null | undefined): T => {
    expect(obj).toBeDefined();
    return obj as T;
  }


// test('Integration test', async () => {
//     const { data: uixData, error: uixError } = await tryCatch({
//         try: () => execSync('pnpm uix'),
//         catch: (e: Error) => Err({
//             type: 'TestErr',
//             subtype: 'UixError',
//             message: e.message,
//             data: { e }
//         })
//     })
//     // console.log("HERE!")
//     // Create Node
//     const { data: userNode, error: createUserNodeError } = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
//         email: `${uuid()}@localTest.com`,
//         firstName: 'Local',
//         lastName: 'Test',
//         userType: 'Unspecified',
//         completedOnboardingV2: false,
//     })
//     if (createUserNodeError) {
//         console.error(createUserNodeError)
//         expect(createUserNodeError).toBeFalsy()
//         return
//     }
//     expect(userNode).toBeTruthy()
//     const { data: createdEducationNode, error: createEducationNodeError } = await createNode(
//         userNode,
//         'Education', {
//         school: 'RPI',
//         graduationYear: 2022,
//         description: 'I studied math',
//         degree: 'Masters',
//         fieldOfStudy: 'Electrical Engineering',
//     })
//     if (createEducationNodeError) {
//         console.error(createEducationNodeError)
//         expect(createEducationNodeError).toBeFalsy()
//         return
//     }
//     expect(createdEducationNode).toBeTruthy()
//     const { data: createdEducationVectorNode, error: createEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${createdEducationNode.nodeType}Vector`, nodeId: createdEducationNode.nodeId })
//     if (createEducationVectorNodeError) {
//         console.error(createEducationVectorNodeError)
//         expect(createEducationVectorNodeError).toBeFalsy()
//         return
//     }
//     expect(createdEducationVectorNode).toBeTruthy()

//     // Check updates
//     const { data: updatedEducationNode, error: updateEducationNodeError } = await updateNode(createdEducationNode, {
//         school: 'RPI',
//         description: 'I studied Basket weaving',
//         degree: 'Masters',
//         fieldOfStudy: 'Electrical Engineering',
//     })
//     if (updateEducationNodeError) {
//         console.error(updateEducationNodeError)
//         expect(updateEducationNodeError).toBeFalsy()
//         return
//     }
//     expect(updatedEducationNode).toBeTruthy()

//     const { data: updatedEducationVectorNode, error: updateEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${updatedEducationNode.nodeType}Vector`, nodeId: updatedEducationNode.nodeId })
//     if (updateEducationVectorNodeError) {
//         console.error(updateEducationVectorNodeError)
//         expect(updateEducationVectorNodeError).toBeFalsy()
//         return
//     }
//     expect(updatedEducationVectorNode).toBeTruthy()
//     expect(createdEducationVectorNode.description![0]).not.toEqual(updatedEducationVectorNode.description![0])


//     // Check getAllNodeType
//     const { data: allEducationNodes, error: getAllEducationNodesError } = await getAllOfNodeType('Education')
//     if (getAllEducationNodesError) {
//         console.error(getAllEducationNodesError)
//         expect(getAllEducationNodesError).toBeFalsy()
//         return
//     }

//     expect(allEducationNodes).toBeTruthy()
//     expect(allEducationNodes.length).toBeGreaterThan(0)

//     // Check getChildNodeSEt
//     const { data: childEducationNodes, error: getChildEducationNodesError } = await getChildNodeSet(userNode, 'Education')
//     if (getChildEducationNodesError) {
//         console.error(getChildEducationNodesError)
//         expect(getChildEducationNodesError).toBeFalsy()
//         return
//     }
//     expect(childEducationNodes).toBeTruthy()
//     expect(childEducationNodes.length).toBeGreaterThan(0)
//     // childEducationNodes[0] // Type test
//     // Check getUniqueChildNode
//     const { data: workPreferenceNode, error: getUniqueProfileNodeError } = await getUniqueChildNode(userNode, 'Profile')
//     if (getUniqueProfileNodeError) {
//         console.error(getUniqueProfileNodeError)
//         expect(getUniqueProfileNodeError).toBeFalsy()
//         return
//     }
//     expect(workPreferenceNode).toBeTruthy()

//     // Check getNodeByIndex
//     const { data: userNodeByIndex, error: getUserNodeByIndexError } = await getNodeByIndex('User', 'email', userNode.email)
//     if (getUserNodeByIndexError) {
//         console.error(getUserNodeByIndexError)
//         expect(getUserNodeByIndexError).toBeFalsy()
//         return
//     }
//     expect(userNodeByIndex).toBeTruthy()
//     // Check deleteNode
//     const { data: deleted, error: deleteError } = await deleteNode(userNodeByIndex)
//     if (deleteError) {
//         console.error(deleteError)
//         expect(deleteError).toBeFalsy()
//         return
//     }
//     expect(deleted).toBeTruthy()
// })


describe('Node', () => {
    describe('is created normally when', () => {
        it('one node is created', async () => {
        const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
            email: 'email@email.com',
            firstName: 'First',
            lastName: 'Last',
            userType: 'Candidate',
            completedOnboardingV2: false,
            phoneNumber: '1234567890',
            profileImageUrl: 'https://www.google.com'
        })
        expect(userNode).toBeTruthy()
        })
        it('two nodes are created at once', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const profileNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Profile', {
                aboutMe: 'I am a person',
                city: 'New York',
                skills: ['skill1', 'skill2', 'skill3'],
                state: 'NY',
            })
            expect(profileNode).toBeTruthy()
            expect(profileNode.error).toBeFalsy()
        })
        it('several nodes are created at once', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const profileNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Profile', {
                aboutMe: 'I am a person',
                city: 'New York',
                skills: ['skill1', 'skill2', 'skill3'],
                state: 'NY',
            })
            expect(profileNode).toBeTruthy()
            expect(profileNode.error).toBeFalsy()
            for (let i = 0; i < 3; i ++) {
                const educationNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Education', {
                    school: 'RPI',
                    graduationYear: 2022,
                    description: 'I studied math',
                    degree: 'Masters',
                    fieldOfStudy: 'Electrical Engineering',
                })
                expect(educationNode).toBeTruthy()
                expect(educationNode.error).toBeFalsy()
                const workExperienceNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'WorkExperience', {
                    companyName: 'Company',
                    description: 'I worked there',
                    title: 'Software Engineer',
                    startYear: 2018,
                    endYear: 2022
                })
                expect(workExperienceNode).toBeTruthy()
                expect(workExperienceNode.error).toBeFalsy()
            }
        })
    })
    describe('is not created when', () => {
        it('invalid data is passed', async () => {
            expect(async () => {
                const thing = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: false,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })}
        ).rejects.toThrow()
        })
        it('a node with duplicate identifiers is made', async () => {
            const email = uuid()
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${email}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const userNode2 = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${email}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode2).toBeTruthy()
            expect(userNode2.error).toBeTruthy()
        })
    })
    describe('is updated normally when', async () => {
        const nodeToUpdate = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
            email: `${uuid()}@localTest.com`,
            firstName: 'First',
            lastName: 'Last',
            userType: 'Candidate',
            completedOnboardingV2: false,
            phoneNumber: '1234567890',
            profileImageUrl: 'https://www.google.com'
        })
        it('one node is updated with valid data', async () => {
        
            const updates = await updateNode({nodeType: 'User', nodeId: nodeToUpdate.data.nodeId}, {
                email: `${uuid()}@gmail.com`,
                firstName: 'Last',
                lastName: 'First',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.youtube.com'
            });

            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
        
        })
        it('one node is updated with data from another node', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const updates = await updateNode({nodeType: 'User', nodeId: nodeToUpdate.data.nodeId}, {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: userNode.data.userType,
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            });

            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
        })
        it('only some fields are updated', async () => {
            const updates = await updateNode({nodeType: 'User', nodeId: nodeToUpdate.data.nodeId}, {
                lastName: 'hello'
            });
            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
        })
    })
    describe('is not updated when', async () => {
        const nodeToUpdate = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
            email: `${uuid()}@localTest.com`,
            firstName: 'First',
            lastName: 'Last',
            userType: 'Candidate',
            completedOnboardingV2: false,
            phoneNumber: '1234567890',
            profileImageUrl: 'https://www.google.com'
        })
        it('invalid data is passed', async () => {
        
            expect( async () => await updateNode({nodeType: 'User', nodeId: nodeToUpdate.data.nodeId}, {
                email: `${uuid()}@gmail.com`,
                firstName: false,
                lastName: 'First',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.youtube.com'
            })).rejects.toThrow()

            expect(nodeToUpdate).toBeTruthy()
            expect(nodeToUpdate.error).toBeFalsy()
        
        })
        it('the node does not exist', async () => {
            const updates = await updateNode({nodeType: 'User', nodeId: uuid()}, {
                firstName: 'hey'
            })

            expect(updates).toBeTruthy()
            expect(updates.error).toBeTruthy()
        })
    })
    describe('is deleted normally when', async () => {
        it('one node is deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
        })
        it('several connected nodes are deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const profileNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Profile', {
                aboutMe: 'I am a person',
                city: 'New York',
                skills: ['skill1', 'skill2', 'skill3'],
                state: 'NY',
            })
            expect(profileNode).toBeTruthy()
            expect(profileNode.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
        })
        it('several unconnected nodes are deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const userNode2 = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode2).toBeTruthy()
            expect(userNode2.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
            const deleted2 = await deleteNode({nodeType: 'User', nodeId: userNode2.data.nodeId})
            expect(deleted2).toBeTruthy()
            expect(deleted2.error).toBeFalsy()
        })

    })
    describe('is not deleted when', async () => {
        it('the node does not exist', async () => {
            const deleted = await deleteNode({nodeType: 'User', nodeId: uuid()})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeTruthy()
        })
    })
    describe('is fetched normally when', async () => {
        it('one node is fetched by index', async () => {
            const email = `${uuid()}@localTest.com`
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: email,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getNodeByIndex('User', 'email', userNode.data.email)
            expect(fetched).toBeTruthy()
            expect(fetched.data.email).toEqual(email)
            expect(fetched.error).toBeFalsy()
        })
        it('all nodes of a type are fetched', async () => {
            const fetched = await getAllOfNodeType('User')
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
        })
        it('all child nodes of a parent node are fetched', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const profileNode = await getUniqueChildNode({nodeType: 'User', nodeId: userNode.data.nodeId}, 'Profile')
            expect(profileNode).toBeTruthy()
            expect(profileNode.error).toBeFalsy()
            for (let i = 0; i < 3; i ++) {
                const educationNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Education', {
                    school: 'RPI',
                    graduationYear: 2022,
                    description: 'I studied math',
                    degree: 'Masters',
                    fieldOfStudy: 'Electrical Engineering',
                })
                expect(educationNode).toBeTruthy()
                expect(educationNode.error).toBeFalsy()
                const workExperienceNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'WorkExperience', {
                    companyName: 'Company',
                    description: 'I worked there',
                    title: 'Software Engineer',
                    startYear: 2018,
                    endYear: 2022
                })
                expect(workExperienceNode).toBeTruthy()
                expect(workExperienceNode.error).toBeFalsy()
            }
            const fetchedEducation = await getChildNodeSet({nodeType: 'User', nodeId: userNode.data.nodeId}, 'Education')
            const fetchedEducationData = assertDefined(fetchedEducation.data)
            expect(fetchedEducation).toBeTruthy()
            expect(fetchedEducation.error).toBeFalsy()
            expect(fetchedEducationData.length).toEqual(3)
            const fetchedWork = await getChildNodeSet({nodeType: 'User', nodeId: userNode.data.nodeId}, 'Education')
            const fetchedWorkData = assertDefined(fetchedWork.data)
            expect(fetchedWork).toBeTruthy()
            expect(fetchedWork.error).toBeFalsy()
            expect(fetchedWorkData.length).toEqual(3)
        })
        it('the unique child node of a parent node is fetched', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const aboutMe = 'I am a person'
            const profileNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Profile', {
                aboutMe: aboutMe,
                city: 'New York',
                skills: ['skill1', 'skill2', 'skill3'],
                state: 'NY',
            })
            const fetched = await getUniqueChildNode({nodeType: 'User', nodeId: userNode.data.nodeId}, 'Profile')
            console.log(fetched)
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            expect(fetched.data.aboutMe).toEqual(aboutMe)
        })
        it('all nodes of a type are fetched', async () => {
            const amountOfNodes = Math.floor(Math.random() * 10)
            const dummyNodeIDs = []
            for (let i = 0; i < amountOfNodes; i++) {
                const dummyNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'Dummy', {
                    name: uuid()
                })
                expect(dummyNode).toBeTruthy()
                expect(dummyNode.error).toBeFalsy()
                dummyNodeIDs.push(dummyNode.data.nodeId)
            }
            const fetched = await getAllOfNodeType('Dummy')
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            expect(assertDefined(fetched.data).length).toEqual(amountOfNodes)
            dummyNodeIDs.forEach(async (id) => {
                const deleted = await deleteNode({nodeType: 'Dummy', nodeId: id})
                expect(deleted).toBeTruthy()
                expect(deleted.error).toBeFalsy()
            })
        })
    })
    describe('is not fetched normally when', async () => {
        it('the node does not exist', async () => {
            const fetched = await getNodeByIndex('User', 'email', uuid())
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeTruthy()
        })
        it('there are no nodes of that type', async () => {
            const fetched = await getAllOfNodeType('Dummy')
            expect(fetched).toBeTruthy()
            expect(fetched.data).toEqual([])
            expect(fetched.error).toBeFalsy()
        })
    })

})

describe('VectorNode', () => {
    describe('is fetched normally when', async () => {
        it('one node is fetched by key', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
        })
        it('multiple nodes are fetched by key', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const educationNodeIds = []
            const workExperienceNodeIds = []
            for (let i = 0; i < 3; i ++) {
                const educationNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Education', {
                    school: 'RPI',
                    graduationYear: 2022,
                    description: 'I studied math',
                    degree: 'Masters',
                    fieldOfStudy: 'Electrical Engineering',
                })
                expect(educationNode).toBeTruthy()
                expect(educationNode.error).toBeFalsy()
                educationNodeIds.push(educationNode.data.nodeId)
                const workExperienceNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'WorkExperience', {
                    companyName: 'Company',
                    description: 'I worked there',
                    title: 'Software Engineer',
                    startYear: 2018,
                    endYear: 2022
                })
                expect(workExperienceNode).toBeTruthy()
                expect(workExperienceNode.error).toBeFalsy()
                workExperienceNodeIds.push(workExperienceNode.data.nodeId)
            }
            educationNodeIds.forEach(async (id) => {
                const fetched = await getVectorNodeByKey({nodeType: 'Education', nodeId: id})
                expect(fetched).toBeTruthy()
                expect(fetched.error).toBeFalsy()
            })
            workExperienceNodeIds.forEach(async (id) => {
                const fetched = await getVectorNodeByKey({nodeType: 'WorkExperience', nodeId: id})
                expect(fetched).toBeTruthy()
                expect(fetched.error).toBeFalsy()
            })
        })
    })
    describe('is not fetched normally when', async () => {
        it('the node does not exist', async () => {
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: uuid()})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeTruthy()
        })
    })
    describe('is updated normally when', async () => {
        it('one node is updated with valid data', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const updates = await updateNode({nodeType: 'User', nodeId: userNode.data.nodeId}, {
                email: `${uuid()}@gmail.com`,
                firstName: 'Last',
                lastName: 'First',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.youtube.com'
            });
            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
            expect(updates.data).not.toEqual(fetched.data)
        })
        it('one node is updated with data from another node', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const updates = await updateNode({nodeType: 'User', nodeId: userNode.data.nodeId}, {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: userNode.data.userType,
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            });
            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
            expect(updates.data).not.toEqual(fetched.data)
        })
        it('only some fields are updated', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const updates = await updateNode({nodeType: 'User', nodeId: fetched.data.nodeId}, {
                lastName: 'hello'
            });
            expect(updates).toBeTruthy()
            expect(updates.error).toBeFalsy()
            expect(updates.data).not.toEqual(fetched.data)
        })  
    })
    describe('is deleted normally when', async () => {
        it('one node is deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
            const fetchedAfter = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetchedAfter).toBeTruthy()
            expect(fetchedAfter.error).toBeTruthy()
        })
        it('several connected nodes are deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const profileNode = await createNode({ nodeType: 'User', nodeId: userNode.data.nodeId }, 'Profile', {
                aboutMe: 'I am a person',
                city: 'New York',
                skills: ['skill1', 'skill2', 'skill3'],
                state: 'NY',
            })
            expect(profileNode).toBeTruthy()
            expect(profileNode.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
            const fetchedAfter = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetchedAfter).toBeTruthy()
            expect(fetchedAfter.error).toBeTruthy()
        })
        it('several unconnected nodes are deleted', async () => {
            const userNode = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode).toBeTruthy()
            expect(userNode.error).toBeFalsy()
            const userNode2 = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
                email: `${uuid()}@localTest.com`,
                firstName: 'First',
                lastName: 'Last',
                userType: 'Candidate',
                completedOnboardingV2: false,
                phoneNumber: '1234567890',
                profileImageUrl: 'https://www.google.com'
            })
            expect(userNode2).toBeTruthy()
            expect(userNode2.error).toBeFalsy()
            const fetched = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetched).toBeTruthy()
            expect(fetched.error).toBeFalsy()
            const fetched2 = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode2.data.nodeId})
            expect(fetched2).toBeTruthy()
            expect(fetched2.error).toBeFalsy()
            const deleted = await deleteNode({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(deleted).toBeTruthy()
            expect(deleted.error).toBeFalsy()
            const deleted2 = await deleteNode({nodeType: 'User', nodeId: userNode2.data.nodeId})
            expect(deleted2).toBeTruthy()
            expect(deleted2.error).toBeFalsy()
            const fetchedAfter = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode.data.nodeId})
            expect(fetchedAfter).toBeTruthy()
            expect(fetchedAfter.error).toBeTruthy()
            const fetchedAfter2 = await getVectorNodeByKey({nodeType: 'User', nodeId: userNode2.data.nodeId})
            expect(fetchedAfter2).toBeTruthy()
            expect(fetchedAfter2.error).toBeTruthy()
        })
    })
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
