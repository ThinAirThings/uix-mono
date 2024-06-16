import { GenericAction } from "./Action";



export enum TriggerTypes {
    OnCreate = 'OnCreate',
    OnUpdate = 'OnUpdate',
    OnDelete = 'OnDelete',
}

export type TriggerMapEntry<Keys extends readonly string[] | undefined> = {
    keys: Keys,
    triggers: GenericAction[],
}
export type AnyTriggerMap = TriggerMap<any, any, any>
export class TriggerMap<
    OnCreateTriggerKeys extends readonly string[] | undefined = undefined,
    OnUpdateTriggerKeys extends readonly string[] | undefined = undefined,
    OnDeleteTriggerKeys extends readonly string[] | undefined = undefined
> {
    private triggerMap: Map<TriggerTypes,
        Map<string, GenericAction>
    > = new Map([
        [TriggerTypes.OnCreate, new Map()],
        [TriggerTypes.OnUpdate, new Map()],
        [TriggerTypes.OnDelete, new Map()],
    ]);
    constructor(
        public onCreateTriggerMap: {
            keys: OnCreateTriggerKeys,
            triggers: GenericAction[],
        } | undefined = undefined,
        public onUpdateTriggerKeys: TriggerMapEntry<OnUpdateTriggerKeys> | undefined = undefined,
        public onDeleteTriggerKeys: TriggerMapEntry<OnDeleteTriggerKeys> | undefined = undefined,
    ) {
        onCreateTriggerMap?.keys?.forEach((key, index) => {
            this.triggerMap.get(TriggerTypes.OnCreate)!.set(key, onCreateTriggerMap.triggers[index])
        })
        onUpdateTriggerKeys?.keys?.forEach((key, index) => {
            this.triggerMap.get(TriggerTypes.OnUpdate)!.set(key, onUpdateTriggerKeys.triggers[index])
        })
        onDeleteTriggerKeys?.keys?.forEach((key, index) => {
            this.triggerMap.get(TriggerTypes.OnDelete)!.set(key, onDeleteTriggerKeys.triggers[index])
        })
    }
    addTrigger<
        TriggerType extends TriggerTypes,
        TriggerKey extends string,
    >(
        triggerType: TriggerType,
        triggerKey: TriggerKey,
        trigger: GenericAction,
    ) {
        return triggerType === TriggerTypes.OnCreate
            ? new TriggerMap({
                keys: [...this.onCreateTriggerMap?.keys ?? [], triggerKey] as const,
                triggers: [...this.onCreateTriggerMap?.triggers ?? [], trigger]
            },
                this.onUpdateTriggerKeys,
                this.onDeleteTriggerKeys,
            )
            : triggerType === TriggerTypes.OnUpdate
                ? new TriggerMap(
                    this.onCreateTriggerMap,
                    {
                        keys: [...this.onUpdateTriggerKeys?.keys ?? [], triggerKey] as const,
                        triggers: [...this.onUpdateTriggerKeys?.triggers ?? [], trigger]
                    },
                    this.onDeleteTriggerKeys,
                )
                : triggerType === TriggerTypes.OnDelete
                    ? new TriggerMap(
                        this.onCreateTriggerMap,
                        this.onUpdateTriggerKeys,
                        {
                            keys: [...this.onDeleteTriggerKeys?.keys ?? [], triggerKey] as const,
                            triggers: [...this.onDeleteTriggerKeys?.triggers ?? [], trigger]
                        },
                    )
                    : this
    }
}

export const defineTriggerMap = <
    OnCreateTriggerKeys extends readonly string[],
    OnUpdateTriggerKeys extends readonly string[],
    OnDeleteTriggerKeys extends readonly string[],
>({
    onCreateTriggerMap,
    onUpdateTriggerKeys,
    onDeleteTriggerKeys
}: {
    onCreateTriggerMap?: {
        keys: OnCreateTriggerKeys,
        triggers: GenericAction[],
    },
    onUpdateTriggerKeys?: {
        keys: OnUpdateTriggerKeys,
        triggers: GenericAction[],
    },
    onDeleteTriggerKeys?: {
        keys: OnDeleteTriggerKeys,
        triggers: GenericAction[],
    }
}) => new TriggerMap(
    onCreateTriggerMap,
    onUpdateTriggerKeys,
    onDeleteTriggerKeys,
)
