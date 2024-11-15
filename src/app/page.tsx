import BitcoinPrice from "@/components/BitcoinPrice";
import SolanaPrice from "@/components/SolanaPrice";
import USDPrice from "@/components/USDPrice";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-emerald-50 h-100">
        <Box textAlign="center" py="4">
          <BitcoinPrice />
          <USDPrice />
          <SolanaPrice />
        </Box>
        <Box display="flex" justifyContent="center" p="10">
          <Image src="/images/front-page.jpeg" height={500} width={500} alt="" />
        </Box>
      </div>
    </>
  );
}
