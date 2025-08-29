import { z } from "zod";

import { procedure, router, t, privateProcedure } from "../trpc";

const userRouter = router({
  me: privateProcedure.query(({ ctx }) => {
    // ctx.session is guaranteed to be non-null by privateProcedure
    return ctx.session;
  }),
});

export { userRouter };
