# @apps-next Monorepo

## Start the application

Run `npx nx serve apps-next` to start the development server. Happy coding!

## Build for production

Run `npx nx build apps-next` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.

## Running tasks

To execute tasks with Nx use the following syntax:

```
npx nx <target> <project> <...options>
```

You can also run multiple targets:

```
npx nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
npx nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).

## Set up CI!

Nx comes with local caching already built-in (check your `nx.json`). On CI you might want to go a step further.

- [Set up remote caching](https://nx.dev/features/share-your-cache)
- [Set up task distribution across multiple machines](https://nx.dev/nx-cloud/features/distribute-task-execution)
- [Learn more how to setup CI](https://nx.dev/recipes/ci)

## Explore the project graph

Run `npx nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx.

---

## Vite + Nx

- To use enviroment variables you have to prefix the variable with `VITE_`:
  `VITE_CONVEX_URL=YOUR_URL`

## Turso + Prisma

### Create Migration file based on the prisma schema

### Create Turso Database

- `turso  db create`

> Note: Using "light-flint" as the database name (replace with your database name)

### Create Turso Token

- `turso db tokens create light-flint`

- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql`

### Create tables based on the prisma schema migration

- `turso db shell light-flint < ./apps/nextjs/migration.sql`

### Update the schema.prisma file

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

```

### Create a db.ts file for the prisma client

```ts
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

export const singleton = <Value>(name: string, valueFactory: () => Value): Value => {
  const g = global as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name];
};

const prisma = singleton('prisma', () => {
  if (process.env.NODE_ENV !== 'production') {
    return new PrismaClient();
  } else {
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL ?? '',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(turso);
    return new PrismaClient({ adapter });
  }
});

prisma.$connect();

export { prisma };
```

## Vercel + @tanstack/router -> Update the vercel.json file

- if not adding the following, lines, vercel will show a 404 error after refreshing the page

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
