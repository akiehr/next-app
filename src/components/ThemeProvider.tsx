"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import React from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600"] });

const theme = extendTheme({
  fonts: {
    heading: montserrat.style.fontFamily,
    body: montserrat.style.fontFamily,
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
