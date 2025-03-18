---
id: 42o2k6t4wxdatm8de68elg2
title: Ideas&features
desc: ''
updated: 1724251430282
created: 1723657175909
---

# Ideas&features

<!-- HOW TO keep type inference -->

```ts
type TypeOfPerson = 'student' | 'kid';
// this will keep the type as narrow as possible but allow to enter any string
type TypeOfPersonOrString = keyof TypeOfPerson<T> | (string & {});
```
