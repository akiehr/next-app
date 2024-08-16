"use client";

import { Box, Button, ScaleFade } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showImage, setShowImage] = useState(false);
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh" py={15}>
        <Button onClick={() => setShowImage(true)} size="lg" colorScheme="teal" hidden={showImage}>
          Clickeame!
        </Button>
        <ScaleFade initialScale={0.9} in={showImage}>
          <Image src="/images/snupy.jpeg" width={500} height={500} alt="snupy" hidden={!showImage} />
        </ScaleFade>
      </Box>
    </>
  );
}
