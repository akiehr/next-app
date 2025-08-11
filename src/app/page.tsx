import CryptoPrice from "@/components/CryptoPrice";
import SariAge from "@/components/SariAge";
import USDPrice from "@/components/USDPrice";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-emerald-50 h-100">
        <Box textAlign="center" py="4">
          <CryptoPrice currency="BTC" />
          <CryptoPrice currency="SOL" />
          <CryptoPrice currency="ADA" />
          <CryptoPrice currency="ETH" />

          <USDPrice />
        </Box>
        <Box textAlign="center" py="4">
          <SariAge label="Sara" />
        </Box>
        <Box display="flex" justifyContent="center" p="10">
          <Image src="/images/front-page.jpeg" height={500} width={500} alt="" />
        </Box>
      </div>
    </>
  );
}
