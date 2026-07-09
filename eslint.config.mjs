import next from "eslint-config-next";

/**
 * Module boundary rules (ARCHITECTURE.md §2/§3):
 *  - Other modules may import ONLY from a module's public `index.ts`.
 *  - The internal layers (domain/application/infrastructure/ui) are private.
 *  - The domain layer must stay free of framework/infrastructure imports.
 */
export default [
  ...next,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/domain/*",
                "@/modules/*/application/*",
                "@/modules/*/infrastructure/*",
                "@/modules/*/ui/*",
              ],
              message:
                "Import a module only through its public index.ts (e.g. '@/modules/orders'), not its internal layers.",
            },
          ],
        },
      ],
    },
  },
  {
    // The domain layer must remain pure: no Prisma, no Next, no React.
    files: ["src/modules/*/domain/**/*.ts", "src/modules/shared/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@prisma/client", "next", "next/*", "react", "react-dom"],
              message: "The domain layer must not depend on frameworks or infrastructure.",
            },
          ],
        },
      ],
    },
  },
];
