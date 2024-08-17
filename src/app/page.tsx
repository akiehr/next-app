import { Box, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <Box textAlign="center" py="20">
          <Heading as="h1" size="2xl" mb="4">
            En busca del pastelito perfecto{" "}
          </Heading>
          <Text fontSize="xl" color="gray.600">
            proximamente...{" "}
          </Text>
          <Box display="flex" justifyContent="center">
            <Image src="/images/snupy.png" height={300} width={300} alt="" />
          </Box>
        </Box>
      </div>
    </>
  );
}
