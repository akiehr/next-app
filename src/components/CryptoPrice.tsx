"use client";

import React, { useState, useEffect } from "react";
import { Flex, Text, Spinner } from "@chakra-ui/react";
import axios from "axios";
import Image from "next/image";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import manifest from "cryptocurrency-icons/manifest.json";

interface CryptoPriceProps {
  currency: string;
}

const CryptoPrice: React.FC<CryptoPriceProps> = ({ currency }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [yesterdayPrice, setYesterdayPrice] = useState<number | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [criptoName, setCriptoName] = useState("");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch current price
        const currentPriceResponse = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${currency}USDT`);
        setPrice(parseFloat(currentPriceResponse.data.price));

        // Fetch historical price
        const historicalPriceResponse = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${currency}USDT&interval=1d&limit=2`);
        const yesterdayClose = parseFloat(historicalPriceResponse.data[0][4]);
        setYesterdayPrice(yesterdayClose);

        // Set icon URL
        const iconEntry = manifest.find((item) => item.symbol.toLowerCase() === currency.toLowerCase());
        if (iconEntry) {
          setIconUrl(`/icons/${iconEntry.symbol.toLowerCase()}.svg`);
          setCriptoName(iconEntry.name);
        } else {
          setIconUrl(`/icon/generic.svg`);
        }
      } catch (error) {
        console.error(`Error fetching ${currency} prices:`, error);
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 6000);

    return () => clearInterval(intervalId);
  }, [currency]);

  const isPriceUp = price && yesterdayPrice && price > yesterdayPrice;
  const isPriceDown = price && yesterdayPrice && price < yesterdayPrice;
  const formatPrice = (value: number) => {
    return value >= 10 ? `USD ${Math.trunc(value)}` : `USD ${value.toFixed(2)}`;
  };

  const color = price && yesterdayPrice ? (price > yesterdayPrice ? "green" : "red") : "black";

  return (
    <Flex alignItems="center" p={4} borderRadius="md" boxShadow="md">
      {iconUrl && <Image src={iconUrl} height={32} width={32} alt={`${currency} logo`} className="mx-4" />}
      <Text fontSize="2xl" ml={2}>
        {criptoName}
      </Text>
      {price ? (
        <Text fontSize="2xl" fontWeight="bold" ml={2} color={color}>
          {formatPrice(price)}
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

export default CryptoPrice;
