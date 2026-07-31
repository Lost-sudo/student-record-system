  "use client";

 import type { ReactNode } from "react";
 import { QueryClientProvider } from "@tanstack/react-query";
 import { queryClient } from "@/api/queryClient";

 type QueryProvidersProps = {
   children: ReactNode;
 };

 export default function QueryProviders({ children }: QueryProvidersProps) {
   return (
     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
 }
