import BitcoinPrice from "@/components/BitcoinPrice";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Box className="absolute top-4 left-4">
        <BitcoinPrice />
      </Box>
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <Box textAlign="center" py="20">
          <Box display="flex" justifyContent="center">
            <Image src="/images/front-page.jpeg" height={500} width={500} alt="" />
          </Box>
        </Box>
      </div>
    </>
  );
}
