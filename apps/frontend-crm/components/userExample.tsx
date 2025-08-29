"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FC } from "react";

interface UserExampleProps {
  // Add your props here
}

const UserExample: FC<UserExampleProps> = ({}) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.user.me.queryOptions());

  return <div>{JSON.stringify(data)}</div>;
};

export default UserExample;
