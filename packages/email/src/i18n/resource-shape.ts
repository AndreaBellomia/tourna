export type TranslationResourceShape<TValue> = TValue extends string
  ? string
  : TValue extends ReadonlyArray<infer TItem>
    ? ReadonlyArray<TranslationResourceShape<TItem>>
    : {
        readonly [TKey in keyof TValue]: TranslationResourceShape<TValue[TKey]>
      }
