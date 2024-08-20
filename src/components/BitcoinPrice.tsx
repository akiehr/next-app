"use client";
import { useState, useEffect } from "react";
import { Flex, Text, Spinner } from "@chakra-ui/react";
import axios from "axios";
import Image from "next/image";
import { ArrowLongDownIcon, ArrowLongUpIcon } from "@heroicons/react/24/outline";

const BitcoinPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [yesterdayPrice, setYesterdayPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const currentPriceResponse = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        setPrice(parseFloat(currentPriceResponse.data.price));

        const historicalPriceResponse = await axios.get("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=2");
        const yesterdayClose = parseFloat(historicalPriceResponse.data[0][4]);
        setYesterdayPrice(yesterdayClose);
      } catch (error) {
        console.error("Error fetching the Bitcoin prices:", error);
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
      <Image src="/images/Bitcoin-Logo.png" height={64} width={64} alt="" />
      {price ? (
        <Text fontSize="2xl" fontWeight="bold" ml={2} color={color}>
          {`USD ${Math.trunc(price)}`}
        </Text>
      ) : (
        <Spinner />
      )}
      {isPriceUp ? (
        <ArrowLongUpIcon className="w-5 h-5 ml-1" color={color} />
      ) : isPriceDown ? (
        <ArrowLongDownIcon className="w-5 h-5 ml-1" color={color} />
      ) : null}
    </Flex>
  );
};

export default BitcoinPrice;
