import { PropsWithChildren } from "react";
export default function MyTitle({ children }: PropsWithChildren) {
  return <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{children}</h1>;
}
