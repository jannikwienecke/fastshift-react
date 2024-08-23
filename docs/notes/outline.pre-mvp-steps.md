---
id: 61256rqi3pi0n6ny0pivu3c
title: Pre Mvp Steps
desc: ''
updated: 1724430626973
created: 1723444563681
---

> Reminder: Write down the plan for the day
> Write down thoughts and plan for the next day
> Take time for the „little“ things
> This is your chance
> It’s not about how far I come but how good the things are that are created

Write down how it should look in the end !!

Add a small doc section to each new progress step

# Pre MVP Steps

- [x] Set up nx monorepo
  - [x] Add Note extension
  - [x] Vite react app
  - [x] Connect to nx cloud
  - [x] 1 package
  - [x] Next js app - Default
- [x] Deploy to Vercel
- [x] Deploy package (core) to npm
- [x] Add a second package that depends on the first one (ui)
- [x] Add convex as a package
- [x] Add Prisma to nextjs app
- [x] use turso as a database in production and sqlite in dev
- [ ] embed convex adapter in the vite app

  - [ ] add query string for query
  - [ ] Clean up !

    - [x] Create internal and external for libraries
    - [x] Add tags !
    - [x] Check graph
    - [x] fix nextjs app deployment - use prisma workaround plugin
    - [x] add logging library
    - [x] Great test data & Schema
    - [x] Clean Up
    - [x] server side nextjs react query
    - [x] create real config with fields and sserch fields for prisma and convex
    - [x] create view loadeer and mutation handler for convex and prisma
    - [x] create a delete|create|update mutation for prisma
    - [x] add test data / schema and seed for nextjs app
    - [x] create a delete|create|update mutation for convex
    - [ ] add relational fields
    - [ ] Required relational fields
    - [ ] test how a reusable component would look like (use list as example)
    - [ ] test how a reusable component would look like (use query as example)
      - list item can delete, can open a record, can update and can be customized
    - [ ] remove any's
    - [ ] get, post, search should work for both apps generically
    - [ ] Extract the "components" into new package (ui)
    - [ ] Write tests - use for both apps
    - [ ] Wishful thinking - Desired Api Design
    - [ ] Write most naive implementation to pass the tests in nextjs app
    - [ ] Write abstraction

  - [ ] write parser -> convex to zod schema
