import React from "react";
import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { UserIcon, CakeIcon, CalendarIcon, HeartIcon, SparklesIcon } from "@heroicons/react/24/outline";

type Props = {
  birthDate?: string; // formato ISO: 'YYYY-MM-DD'
  label?: string;
  now?: Date; // para testing opcional
};

function parseBirth(birthISO: string) {
  const [yB, mB, dB] = birthISO.split("-").map((s) => parseInt(s, 10));
  if (Number.isNaN(yB) || Number.isNaN(mB) || Number.isNaN(dB)) {
    throw new Error("birthDate debe tener formato YYYY-MM-DD");
  }
  return { yB, mB, dB };
}

function utcTodayParts(now?: Date) {
  const t = now ? new Date(now) : new Date();
  return { yT: t.getUTCFullYear(), mT: t.getUTCMonth() + 1, dT: t.getUTCDate() };
}

function lastDayOfMonthUTC(year: number, month1to12: number) {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

function daysBetweenUTC(a: Date, b: Date) {
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUTC - aUTC) / (1000 * 60 * 60 * 24));
}

function getMonthsAndDays(birthISO: string, now?: Date) {
  const { yB, mB, dB } = parseBirth(birthISO);
  const { yT, mT, dT } = utcTodayParts(now);

  let months = (yT - yB) * 12 + (mT - mB);
  let days: number;

  if (dT >= dB) {
    days = dT - dB;
  } else {
    months -= 1;
    const lastDayPrevMonth = lastDayOfMonthUTC(yT, mT - 1);
    days = lastDayPrevMonth - dB + dT;
  }

  if (months < 0 || (months === 0 && days < 0)) {
    return { months: 0, days: 0 };
  }

  return { months, days };
}

function getNextMonthiversaryAndBirthday(birthISO: string, now?: Date) {
  const { yB, mB, dB } = parseBirth(birthISO);
  const { yT, mT, dT } = utcTodayParts(now);
  const todayUTC = new Date(Date.UTC(yT, mT - 1, dT));

  // Próximo cumple-mes: día dB en el mes actual o siguiente
  let candYear = yT;
  let candMonth = mT;
  let candDay = dB;

  // ajustamos día si no existe en ese mes
  const lastDayThisMonth = lastDayOfMonthUTC(candYear, candMonth);
  if (candDay > lastDayThisMonth) candDay = lastDayThisMonth;
  let candidate = new Date(Date.UTC(candYear, candMonth - 1, candDay));
  if (candidate <= todayUTC) {
    // pasar al mes siguiente
    if (candMonth === 12) {
      candMonth = 1;
      candYear += 1;
    } else {
      candMonth += 1;
    }
    candDay = dB;
    const lastDayNext = lastDayOfMonthUTC(candYear, candMonth);
    if (candDay > lastDayNext) candDay = lastDayNext;
    candidate = new Date(Date.UTC(candYear, candMonth - 1, candDay));
  }
  const daysUntilMonthiversary = daysBetweenUTC(todayUTC, candidate);

  // Próximo cumpleaños: el mes mB y día dB en el año actual o siguiente
  let birthdayYear = yT;
  let birthdayDay = dB;
  const lastDayBirthdayMonthThisYear = lastDayOfMonthUTC(birthdayYear, mB);
  if (birthdayDay > lastDayBirthdayMonthThisYear) birthdayDay = lastDayBirthdayMonthThisYear;
  let birthdayCandidate = new Date(Date.UTC(birthdayYear, mB - 1, birthdayDay));
  if (birthdayCandidate <= todayUTC) {
    birthdayYear += 1;
    birthdayDay = dB;
    const lastDayBirthdayMonthNextYear = lastDayOfMonthUTC(birthdayYear, mB);
    if (birthdayDay > lastDayBirthdayMonthNextYear) birthdayDay = lastDayBirthdayMonthNextYear;
    birthdayCandidate = new Date(Date.UTC(birthdayYear, mB - 1, birthdayDay));
  }
  const daysUntilBirthday = daysBetweenUTC(todayUTC, birthdayCandidate);

  return { daysUntilMonthiversary, daysUntilBirthday };
}

export default function SariAge({ birthDate = "2025-07-06", label = "Mi hija", now }: Props) {
  const { months, days } = getMonthsAndDays(birthDate, now);
  const { daysUntilMonthiversary, daysUntilBirthday } = getNextMonthiversaryAndBirthday(birthDate, now);

  const formatDays = (n: number) => (n === 0 ? "¡Hoy!" : `${n} día${n === 1 ? "" : "s"}`);

  return (
    <Flex alignItems="center" borderRadius="md" boxShadow="md">
      {" "}
      <Box textAlign="center" p={4} bg="purple.50" borderRadius="lg" boxShadow="sm">
        <VStack spacing={2}>
          <HStack spacing={2} alignItems="center">
            <Box color="purple.500">
              <HStack spacing={0}>
                <SparklesIcon width={16} height={16} aria-hidden />
                <HeartIcon width={16} height={16} aria-hidden />
              </HStack>
            </Box>
            <Text fontSize="lg" color="purple.600">
              {label}
            </Text>
          </HStack>

          <Text fontSize="xl" fontWeight="semibold" color="purple.700">
            {months} {months === 1 ? "mes" : "meses"} y {days} {days === 1 ? "día" : "días"}
          </Text>

          <HStack spacing={3} pt={2}>
            <HStack spacing={2}>
              <Box color="purple.500">
                <CalendarIcon width={16} height={16} aria-hidden />
              </Box>
              <Text fontSize="xs" color="purple.600">
                Próx. cumple-mes: {formatDays(daysUntilMonthiversary)}
              </Text>
            </HStack>

            <HStack spacing={2}>
              <Box color="purple.500">
                <CakeIcon width={16} height={16} aria-hidden />
              </Box>
              <Text fontSize="xs" color="purple.600">
                Próx. cumple: {formatDays(daysUntilBirthday)}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
}
