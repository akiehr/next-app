import { Box } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Box display="flex" justifyContent="center">
        <Image src="/images/snupy.jpeg" width={500} height={500} alt="snupy" />
      </Box>
    </>
  );
}
