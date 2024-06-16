import { defineTriggerMap, TriggerMap, TriggerTypes } from "../types/TriggerMap";



export const baseTriggerMap = defineTriggerMap({})
    .addTrigger(TriggerTypes.OnCreate, 'baseTriggerMap', (node) => {
        console.log('baseTriggerMap onCreate', node)
    })


baseTriggerMap.onCreateTriggerMap?.keys['']