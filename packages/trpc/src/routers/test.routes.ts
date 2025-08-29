import { z } from "zod";

import { procedure, router, t, privateProcedure } from "../trpc";

const testRouter = router({
  hello: procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        message: `Hello ${input.name}`,
      };
    }),
  greet: procedure.query(() => {
    return {
      message: "Hello World",
    };
  }),
});

export { testRouter };
