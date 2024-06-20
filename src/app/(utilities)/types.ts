export type Head<T extends readonly any[]> = T extends [any, ...any[]] ? T[0] : never;
export type HasHead<T extends readonly any[]> = T extends [] ? false : true;
export type Tail<T extends readonly any[]> = ((...t: T) => any) extends (h: any, ...r: infer R) => any ? R : never;
export type HasTail<T extends readonly any[]> = T extends ([] | [any]) ? false : true;