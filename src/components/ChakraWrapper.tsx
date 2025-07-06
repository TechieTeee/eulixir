"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { Suspense, lazy } from "react";
import theme from "@/lib/theme";
import LoadingSpinner from "./LoadingSpinner";

// Lazy load WalletProvider to reduce initial bundle
const WalletProvider = lazy(() => import("./WalletProvider"));

export default function ChakraWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider theme={theme}>
      <Suspense fallback={<LoadingSpinner message="Initializing..." />}>
        <WalletProvider>{children}</WalletProvider>
      </Suspense>
    </ChakraProvider>
  );
}
