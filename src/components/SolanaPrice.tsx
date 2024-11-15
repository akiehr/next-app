"use client";
import { useState, useEffect } from "react";
import { Flex, Text, Spinner } from "@chakra-ui/react";
import axios from "axios";
import Image from "next/image";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { ArrowTrendingDownIcon } from "@heroicons/react/24/outline";

const SolanaPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [yesterdayPrice, setYesterdayPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const currentPriceResponse = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT");
        setPrice(parseFloat(currentPriceResponse.data.price));

        const historicalPriceResponse = await axios.get("https://api.binance.com/api/v3/klines?symbol=SOLUSDT&interval=1d&limit=2");
        const yesterdayClose = parseFloat(historicalPriceResponse.data[0][4]);
        setYesterdayPrice(yesterdayClose);
      } catch (error) {
        console.error("Error fetching the Solana prices:", error);
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 6000);

    return () => clearInterval(intervalId);
  }, []);

  const isPriceUp = price && yesterdayPrice && price > yesterdayPrice;
  const isPriceDown = price && yesterdayPrice && price < yesterdayPrice;

  const color = price && yesterdayPrice ? (price > yesterdayPrice ? "green" : "red") : "black";

  return (
    <Flex alignItems="center" p={4} borderRadius="md" boxShadow="md">
      <Image src="/images/solana.png" height={32} width={32} alt="" className="mx-4" />
      {price ? (
        <Text fontSize="2xl" fontWeight="bold" ml={2} color={color}>
          {`USD ${Math.trunc(price)}`}
        </Text>
      ) : (
        <Spinner />
      )}
      {isPriceUp ? (
        <ArrowTrendingUpIcon className="w-5 h-5 ml-1" color={color} />
      ) : isPriceDown ? (
        <ArrowTrendingDownIcon className="w-5 h-5 ml-1" color={color} />
      ) : null}
    </Flex>
  );
};

export default SolanaPrice;
