"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/theme";
import WalletProvider from "./WalletProvider";

export default function ChakraWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider theme={theme}>
      <WalletProvider>{children}</WalletProvider>
    </ChakraProvider>
  );
}
