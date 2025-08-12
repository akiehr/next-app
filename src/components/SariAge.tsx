"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
  Divider,
  Badge,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Collapse,
  IconButton,
} from "@chakra-ui/react";
import {
  UserIcon,
  CakeIcon,
  CalendarIcon,
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Props = {
  birthDate?: string; // formato ISO: 'YYYY-MM-DD'
  label?: string;
  now?: Date; // para testing opcional
};

type Event = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
};

// ... (todas las funciones originales se mantienen igual)
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

  // Próximo cumple-mes
  let candYear = yT;
  let candMonth = mT;
  let candDay = dB;

  const lastDayThisMonth = lastDayOfMonthUTC(candYear, candMonth);
  if (candDay > lastDayThisMonth) candDay = lastDayThisMonth;
  let candidate = new Date(Date.UTC(candYear, candMonth - 1, candDay));
  if (candidate <= todayUTC) {
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

  // Próximo cumpleaños
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

function getDetailedStats(birthISO: string, now?: Date) {
  const birthDate = new Date(birthISO);
  const today = now || new Date();

  const totalDays = daysBetweenUTC(birthDate, today);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  const { months, days } = getMonthsAndDays(birthISO, now);
  const totalWeeks = Math.floor(totalDays / 7);

  // Progreso hasta el próximo cumpleaños
  const { yB, mB } = parseBirth(birthISO);
  const thisYearBirthday = new Date(Date.UTC(today.getUTCFullYear(), mB - 1, birthDate.getUTCDate()));
  const nextBirthday = thisYearBirthday > today ? thisYearBirthday : new Date(Date.UTC(today.getUTCFullYear() + 1, mB - 1, birthDate.getUTCDate()));
  const lastBirthday = new Date(nextBirthday);
  lastBirthday.setUTCFullYear(lastBirthday.getUTCFullYear() - 1);

  const daysSinceLastBirthday = daysBetweenUTC(lastBirthday, today);
  const daysInYear = daysBetweenUTC(lastBirthday, nextBirthday);
  const birthdayProgress = (daysSinceLastBirthday / daysInYear) * 100;

  return {
    totalDays,
    totalHours,
    totalMinutes,
    totalWeeks,
    months,
    days,
    birthdayProgress: Math.min(birthdayProgress, 100),
  };
}

// Hook para cargar eventos
function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Error al cargar eventos");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: { title: string; description?: string; date: string }) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el evento");
      }

      const newEvent = await response.json();
      setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      return newEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el evento");
      }

      // Actualizar el estado local removiendo el evento
      setEvents((prev) => prev.filter((event) => event.id !== eventId));

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents, addEvent, deleteEvent };
}

export default function SariAge({ birthDate = "2025-07-06", label = "Mi hija", now }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const toast = useToast();
  const onOpen = () => setIsOpen(true);
  const onClose = () => {
    setIsOpen(false);
    setShowEventForm(false);
    setEventForm({ title: "", description: "", date: "" });
  };

  const { months, days } = getMonthsAndDays(birthDate, now);
  const { daysUntilMonthiversary, daysUntilBirthday } = getNextMonthiversaryAndBirthday(birthDate, now);
  const stats = getDetailedStats(birthDate, now);
  const { events, loading, error, addEvent, deleteEvent } = useEvents();

  type Measurement = {
    id: string;
    weight: number;
    height: number;
    bmi: number;
    date: string; // ISO string
    notes?: string;
    createdAt: string;
  };

  // Hook para cargar mediciones (agregar junto al hook useEvents)

  function useMeasurements() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMeasurements = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/measurements");
        if (!response.ok) {
          throw new Error("Error al cargar mediciones");
        }
        const data = await response.json();
        setMeasurements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    const addMeasurement = async (measurementData: { weight: string; height: string; date: string; notes?: string }) => {
      try {
        const response = await fetch("/api/measurements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(measurementData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear la medición");
        }

        const newMeasurement = await response.json();
        setMeasurements((prev) => [newMeasurement, ...prev]);

        return newMeasurement;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    const deleteMeasurement = async (measurementId: string) => {
      try {
        const response = await fetch(`/api/measurements?id=${measurementId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar la medición");
        }

        setMeasurements((prev) => prev.filter((measurement) => measurement.id !== measurementId));
        return true;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    useEffect(() => {
      fetchMeasurements();
    }, []);

    return { measurements, loading, error, refetch: fetchMeasurements, addMeasurement, deleteMeasurement };
  }

  // Estados adicionales para agregar al componente principal
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurementForm, setMeasurementForm] = useState({
    weight: "",
    height: "",
    date: "",
    notes: "",
  });
  const [isCreatingMeasurement, setIsCreatingMeasurement] = useState(false);

  // Hook para usar en el componente
  const { measurements, loading: measurementsLoading, error: measurementsError, addMeasurement, deleteMeasurement } = useMeasurements();

  // Funciones para manejar mediciones
  const handleCreateMeasurement = async () => {
    if (!measurementForm.weight.trim() || !measurementForm.height.trim() || !measurementForm.date) {
      // toast({
      //   title: "Campos requeridos",
      //   description: "Por favor completa peso, altura y fecha.",
      //   status: "warning",
      //   duration: 3000,
      //   isClosable: true,
      // });
      return;
    }

    // Validar que sean números positivos
    const weight = parseFloat(measurementForm.weight);
    const height = parseFloat(measurementForm.height);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      // toast({
      //   title: "Valores inválidos",
      //   description: "El peso y la altura deben ser números positivos.",
      //   status: "error",
      //   duration: 3000,
      //   isClosable: true,
      // });
      return;
    }

    setIsCreatingMeasurement(true);
    try {
      await addMeasurement({
        weight: measurementForm.weight.trim(),
        height: measurementForm.height.trim(),
        date: measurementForm.date,
        notes: measurementForm.notes.trim() || undefined,
      });

      // toast({
      //   title: "¡Medición registrada!",
      //   description: "Los datos de peso y altura han sido guardados exitosamente.",
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      // });

      // Limpiar formulario
      setMeasurementForm({ weight: "", height: "", date: "", notes: "" });
      setShowMeasurementForm(false);
    } catch (err) {
      // toast({
      //   title: "Error al registrar medición",
      //   description: err instanceof Error ? err.message : "Error desconocido",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      // });
    } finally {
      setIsCreatingMeasurement(false);
    }
  };

  const handleDeleteMeasurement = async (measurementId: string, measurementDate: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar la medición del ${measurementDate}?`);

    if (!confirmDelete) return;

    try {
      await deleteMeasurement(measurementId);

      // toast({
      //   title: "Medición eliminada",
      //   description: `La medición del ${measurementDate} ha sido eliminada exitosamente.`,
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      // });
    } catch (err) {
      // toast({
      //   title: "Error al eliminar medición",
      //   description: err instanceof Error ? err.message : "Error desconocido",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      // });
    }
  };

  const toggleMeasurementForm = () => {
    setShowMeasurementForm(!showMeasurementForm);
    if (showMeasurementForm) {
      setMeasurementForm({ weight: "", height: "", date: "", notes: "" });
    }
  };

  const formatMeasurementDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getBMIStatus = (bmi: number) => {
    // Clasificación para bebés/niños pequeños (simplificada)
    if (bmi < 14) return { status: "Bajo peso", color: "yellow" };
    if (bmi < 18) return { status: "Normal", color: "green" };
    if (bmi < 21) return { status: "Sobrepeso", color: "orange" };
    return { status: "Obesidad", color: "red" };
  };

  const formatDays = (n: number) => (n === 0 ? "¡Hoy!" : `${n} día${n === 1 ? "" : "s"}`);

  const formatBirthDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    return daysBetweenUTC(today, event);
  };

  // Filtrar próximos eventos (próximos 30 días)
  const upcomingEvents = events
    .filter((event) => {
      const daysUntil = getDaysUntilEvent(event.date);
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .slice(0, 3); // Mostrar máximo 3 eventos

  // Manejar eliminación de eventos
  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar "${eventTitle}"?`);

    if (!confirmDelete) return;

    try {
      await deleteEvent(eventId);

      toast({
        title: "Evento eliminado",
        description: `"${eventTitle}" ha sido eliminado exitosamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error al eliminar evento",
        description: err instanceof Error ? err.message : "Error desconocido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Manejar creación de eventos
  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa al menos el título y la fecha del evento.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreatingEvent(true);
    try {
      await addEvent({
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || undefined,
        date: new Date(eventForm.date).toISOString(),
      });

      toast({
        title: "¡Evento creado!",
        description: `${eventForm.title} ha sido agregado exitosamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Limpiar formulario
      setEventForm({ title: "", description: "", date: "" });
      setShowEventForm(false);
    } catch (err) {
      toast({
        title: "Error al crear evento",
        description: err instanceof Error ? err.message : "Error desconocido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const toggleEventForm = () => {
    setShowEventForm(!showEventForm);
    if (showEventForm) {
      setEventForm({ title: "", description: "", date: "" });
    }
  };

  return (
    <>
      <Flex alignItems="center" borderRadius="md" boxShadow="md">
        <Box
          textAlign="center"
          p={4}
          bg="purple.50"
          borderRadius="lg"
          boxShadow="sm"
          cursor="pointer"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
            bg: "purple.100",
          }}
          transition="all 0.2s"
          onClick={onOpen}
        >
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

            {/* Mostrar próximos eventos si hay */}
            {upcomingEvents.length > 0 && (
              <VStack spacing={1} pt={2}>
                <HStack spacing={2}>
                  <Box color="purple.500">
                    <CalendarDaysIcon width={16} height={16} aria-hidden />
                  </Box>
                  <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                    Próximos eventos:
                  </Text>
                </HStack>
                {upcomingEvents.map((event, index) => (
                  <Text key={event.id} fontSize="xs" color="purple.500">
                    {event.title} - {formatDays(getDaysUntilEvent(event.date))}
                  </Text>
                ))}
              </VStack>
            )}

            <Text fontSize="xs" color="purple.400" fontStyle="italic" pt={1}>
              Click para ver detalles
            </Text>
          </VStack>
        </Box>
      </Flex>

      {/* Modal con detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Box color="purple.500">
                <HeartIcon width={24} height={24} />
              </Box>
              <Text>Detalles de {label}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              {/* Información básica */}
              <Box w="full" p={4} bg="purple.50" borderRadius="lg">
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <CakeIcon width={20} height={20} color="purple" />
                    <Text fontWeight="semibold" color="purple.700">
                      Fecha de nacimiento
                    </Text>
                  </HStack>
                  <Text fontSize="lg" textAlign="center">
                    {formatBirthDate(birthDate)}
                  </Text>
                </VStack>
              </Box>

              {/* Edad actual */}
              <Box w="full" p={4} bg="blue.50" borderRadius="lg">
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <ClockIcon width={20} height={20} color="blue" />
                    <Text fontWeight="semibold" color="blue.700">
                      Edad actual
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                    {stats.months} {stats.months === 1 ? "mes" : "meses"} y {stats.days} {stats.days === 1 ? "día" : "días"}
                  </Text>
                </VStack>
              </Box>

              <Box w="full" p={4} bg="teal.50" borderRadius="lg">
                <VStack spacing={4}>
                  <HStack spacing={2} justify="space-between" w="full">
                    <HStack spacing={2}>
                      <CalendarDaysIcon width={20} height={20} color="teal" />
                      <Text fontWeight="semibold" color="teal.700">
                        Próximos eventos
                      </Text>
                    </HStack>
                    <IconButton
                      aria-label={showEventForm ? "Ocultar formulario" : "Agregar evento"}
                      icon={showEventForm ? <ChevronUpIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
                      size="sm"
                      colorScheme="teal"
                      variant="ghost"
                      onClick={toggleEventForm}
                    />
                  </HStack>

                  {/* Formulario para crear eventos */}
                  <Collapse in={showEventForm} animateOpacity>
                    <Box w="full" p={4} bg="white" borderRadius="md" border="1px solid" borderColor="teal.200">
                      <VStack spacing={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="teal.700" alignSelf="start">
                          Crear nuevo evento
                        </Text>

                        <FormControl>
                          <FormLabel fontSize="sm" color="teal.600">
                            Título del evento*
                          </FormLabel>
                          <Input
                            placeholder="Ej: Visita al pediatra"
                            value={eventForm.title}
                            onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                            size="sm"
                            focusBorderColor="teal.400"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="teal.600">
                            Descripción
                          </FormLabel>
                          <Textarea
                            placeholder="Control y vacunas (opcional)"
                            value={eventForm.description}
                            onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                            size="sm"
                            resize="vertical"
                            rows={2}
                            focusBorderColor="teal.400"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="teal.600">
                            Fecha y hora*
                          </FormLabel>
                          <Input
                            type="datetime-local"
                            value={eventForm.date}
                            onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                            size="sm"
                            focusBorderColor="teal.400"
                          />
                        </FormControl>

                        <HStack spacing={2} w="full" pt={2}>
                          <Button
                            size="sm"
                            colorScheme="teal"
                            onClick={handleCreateEvent}
                            isLoading={isCreatingEvent}
                            loadingText="Creando..."
                            leftIcon={<PlusIcon width={14} height={14} />}
                            flex={1}
                          >
                            Crear evento
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowEventForm(false)} color="gray.600">
                            Cancelar
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Collapse>

                  {loading && (
                    <HStack spacing={2}>
                      <Spinner size="sm" color="teal.500" />
                      <Text fontSize="sm" color="teal.600">
                        Cargando eventos...
                      </Text>
                    </HStack>
                  )}

                  {error && (
                    <Alert status="error" size="sm" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  {!loading && !error && (
                    <>
                      {events.length === 0 ? (
                        <Text fontSize="sm" color="teal.600" textAlign="center">
                          No hay eventos programados
                        </Text>
                      ) : (
                        <VStack spacing={3} w="full">
                          {upcomingEvents.length === 0 ? (
                            <Text fontSize="sm" color="teal.600" textAlign="center">
                              No hay eventos en los próximos 30 días
                            </Text>
                          ) : (
                            upcomingEvents.map((event) => {
                              const daysUntil = getDaysUntilEvent(event.date);
                              return (
                                <Box key={event.id} w="full" p={3} bg="white" borderRadius="md" borderLeft="4px solid" borderLeftColor="teal.400">
                                  <HStack spacing={2} align="start" justify="space-between">
                                    <VStack spacing={1} align="start" flex={1}>
                                      <HStack spacing={2} justify="space-between" w="full">
                                        <Text fontWeight="semibold" color="teal.700" fontSize="sm">
                                          {event.title}
                                        </Text>
                                        <Badge colorScheme="teal" size="sm">
                                          {formatDays(daysUntil)}
                                        </Badge>
                                      </HStack>
                                      {event.description && (
                                        <Text fontSize="xs" color="teal.600">
                                          {event.description}
                                        </Text>
                                      )}
                                      <Text fontSize="xs" color="gray.500">
                                        {formatEventDate(event.date)}
                                      </Text>
                                    </VStack>
                                    <IconButton
                                      aria-label={`Eliminar ${event.title}`}
                                      icon={<TrashIcon width={14} height={14} />}
                                      size="xs"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => handleDeleteEvent(event.id, event.title)}
                                      _hover={{ bg: "red.50" }}
                                    />
                                  </HStack>
                                </Box>
                              );
                            })
                          )}

                          {events.length > 3 && (
                            <Text fontSize="xs" color="teal.500" textAlign="center">
                              Y {events.length - 3} eventos más...
                            </Text>
                          )}
                        </VStack>
                      )}
                    </>
                  )}
                </VStack>
              </Box>

              <Box w="full" p={4} bg="blue.50" borderRadius="lg">
                <VStack spacing={4}>
                  <HStack spacing={2} justify="space-between" w="full">
                    <HStack spacing={2}>
                      <Box color="blue.500">
                        <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </Box>
                      <Text fontWeight="semibold" color="blue.700">
                        Peso y Altura
                      </Text>
                    </HStack>
                    <IconButton
                      aria-label={showMeasurementForm ? "Ocultar formulario" : "Registrar medición"}
                      icon={showMeasurementForm ? <ChevronUpIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={toggleMeasurementForm}
                    />
                  </HStack>

                  {/* Formulario para registrar mediciones */}
                  <Collapse in={showMeasurementForm} animateOpacity>
                    <Box w="full" p={4} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <VStack spacing={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="blue.700" alignSelf="start">
                          Registrar nueva medición
                        </Text>

                        <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                          <GridItem>
                            <FormControl>
                              <FormLabel fontSize="sm" color="blue.600">
                                Peso (kg)*
                              </FormLabel>
                              <Input
                                placeholder="Ej: 4.2"
                                type="number"
                                step="0.1"
                                min="0"
                                value={measurementForm.weight}
                                onChange={(e) => setMeasurementForm((prev) => ({ ...prev, weight: e.target.value }))}
                                size="sm"
                                focusBorderColor="blue.400"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel fontSize="sm" color="blue.600">
                                Altura (cm)*
                              </FormLabel>
                              <Input
                                placeholder="Ej: 60"
                                type="number"
                                step="0.1"
                                min="0"
                                value={measurementForm.height}
                                onChange={(e) => setMeasurementForm((prev) => ({ ...prev, height: e.target.value }))}
                                size="sm"
                                focusBorderColor="blue.400"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        <FormControl>
                          <FormLabel fontSize="sm" color="blue.600">
                            Fecha*
                          </FormLabel>
                          <Input
                            type="date"
                            value={measurementForm.date}
                            onChange={(e) => setMeasurementForm((prev) => ({ ...prev, date: e.target.value }))}
                            size="sm"
                            focusBorderColor="blue.400"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="blue.600">
                            Notas
                          </FormLabel>
                          <Textarea
                            placeholder="Control de rutina, vacunas, etc. (opcional)"
                            value={measurementForm.notes}
                            onChange={(e) => setMeasurementForm((prev) => ({ ...prev, notes: e.target.value }))}
                            size="sm"
                            resize="vertical"
                            rows={2}
                            focusBorderColor="blue.400"
                          />
                        </FormControl>

                        <HStack spacing={2} w="full" pt={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={handleCreateMeasurement}
                            isLoading={isCreatingMeasurement}
                            loadingText="Guardando..."
                            leftIcon={<PlusIcon width={14} height={14} />}
                            flex={1}
                          >
                            Registrar medición
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowMeasurementForm(false)} color="gray.600">
                            Cancelar
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Collapse>

                  {measurementsLoading && (
                    <HStack spacing={2}>
                      <Spinner size="sm" color="blue.500" />
                      <Text fontSize="sm" color="blue.600">
                        Cargando mediciones...
                      </Text>
                    </HStack>
                  )}

                  {measurementsError && (
                    <Alert status="error" size="sm" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">{measurementsError}</AlertDescription>
                    </Alert>
                  )}

                  {!measurementsLoading && !measurementsError && (
                    <>
                      {measurements.length === 0 ? (
                        <Text fontSize="sm" color="blue.600" textAlign="center">
                          No hay mediciones registradas
                        </Text>
                      ) : (
                        <VStack spacing={3} w="full">
                          {/* Mostrar última medición destacada */}
                          {measurements.length > 0 && (
                            <Box w="full" p={3} bg="white" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.400">
                              <VStack spacing={2} align="start">
                                <HStack spacing={2} justify="space-between" w="full">
                                  <Text fontWeight="semibold" color="blue.700" fontSize="sm">
                                    Última medición
                                  </Text>
                                  <Badge colorScheme="blue" size="sm">
                                    Reciente
                                  </Badge>
                                </HStack>
                                <Grid templateColumns="repeat(3, 1fr)" gap={2} w="full">
                                  <VStack spacing={1}>
                                    <Text fontSize="xs" color="gray.500">
                                      Peso
                                    </Text>
                                    <Text fontWeight="bold" color="blue.700">
                                      {measurements[0].weight} kg
                                    </Text>
                                  </VStack>
                                  <VStack spacing={1}>
                                    <Text fontSize="xs" color="gray.500">
                                      Altura
                                    </Text>
                                    <Text fontWeight="bold" color="blue.700">
                                      {measurements[0].height} cm
                                    </Text>
                                  </VStack>
                                  <VStack spacing={1}>
                                    <Text fontSize="xs" color="gray.500">
                                      IMC
                                    </Text>
                                    <Badge colorScheme={getBMIStatus(measurements[0].bmi).color} size="sm">
                                      {measurements[0].bmi}
                                    </Badge>
                                  </VStack>
                                </Grid>
                                <HStack spacing={2} justify="space-between" w="full">
                                  <Text fontSize="xs" color="gray.500">
                                    {formatMeasurementDate(measurements[0].date)}
                                  </Text>
                                  <IconButton
                                    aria-label="Eliminar medición"
                                    icon={<TrashIcon width={12} height={12} />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleDeleteMeasurement(measurements[0].id, formatMeasurementDate(measurements[0].date))}
                                    _hover={{ bg: "red.50" }}
                                  />
                                </HStack>
                                {measurements[0].notes && (
                                  <Text fontSize="xs" color="blue.600" fontStyle="italic">
                                    {measurements[0].notes}
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}

                          {/* Mostrar historial si hay más de una medición */}
                          {measurements.length > 1 && (
                            <VStack spacing={2} w="full">
                              <Divider />
                              <Text fontSize="xs" color="blue.500" fontWeight="semibold">
                                Historial ({measurements.length - 1} mediciones anteriores)
                              </Text>
                              {measurements.slice(1, 4).map((measurement) => (
                                <Box key={measurement.id} w="full" p={2} bg="gray.50" borderRadius="md">
                                  <HStack spacing={2} justify="space-between" align="center">
                                    <VStack spacing={0} align="start">
                                      <HStack spacing={3}>
                                        <Text fontSize="xs" color="gray.700">
                                          {measurement.weight}kg
                                        </Text>
                                        <Text fontSize="xs" color="gray.700">
                                          {measurement.height}cm
                                        </Text>
                                        <Badge size="xs" colorScheme={getBMIStatus(measurement.bmi).color}>
                                          IMC {measurement.bmi}
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="xs" color="gray.500">
                                        {formatMeasurementDate(measurement.date)}
                                      </Text>
                                    </VStack>
                                    <IconButton
                                      aria-label="Eliminar medición"
                                      icon={<TrashIcon width={10} height={10} />}
                                      size="xs"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => handleDeleteMeasurement(measurement.id, formatMeasurementDate(measurement.date))}
                                      _hover={{ bg: "red.50" }}
                                    />
                                  </HStack>
                                </Box>
                              ))}

                              {measurements.length > 4 && (
                                <Text fontSize="xs" color="blue.500" textAlign="center">
                                  Y {measurements.length - 4} mediciones más...
                                </Text>
                              )}
                            </VStack>
                          )}
                        </VStack>
                      )}
                    </>
                  )}
                </VStack>
              </Box>

              {/* Estadísticas detalladas */}
              <Box w="full" p={4} bg="green.50" borderRadius="lg">
                <VStack spacing={4}>
                  <HStack spacing={2}>
                    <SparklesIcon width={20} height={20} color="green" />
                    <Text fontWeight="semibold" color="green.700">
                      Estadísticas de vida
                    </Text>
                  </HStack>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                    <GridItem>
                      <VStack>
                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                          {stats.totalDays.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="green.500">
                          días vividos
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack>
                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                          {stats.totalWeeks.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="green.500">
                          semanas
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack>
                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                          {stats.totalHours.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="green.500">
                          horas
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack>
                        <Text fontWeight="bold" fontSize="xl" color="green.600">
                          {stats.totalMinutes.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="green.500">
                          minutos
                        </Text>
                      </VStack>
                    </GridItem>
                  </Grid>
                </VStack>
              </Box>

              {/* Progreso hacia el próximo cumpleaños */}
              <Box w="full" p={4} bg="orange.50" borderRadius="lg">
                <VStack spacing={4}>
                  <HStack spacing={2}>
                    <SunIcon width={20} height={20} color="orange" />
                    <Text fontWeight="semibold" color="orange.700">
                      Progreso hacia el próximo cumpleaños
                    </Text>
                  </HStack>

                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="orange.600">
                        Último cumpleaños
                      </Text>
                      <Text fontSize="sm" color="orange.600">
                        Próximo cumpleaños
                      </Text>
                    </HStack>
                    <Progress value={stats.birthdayProgress} colorScheme="orange" size="lg" borderRadius="full" />
                    <Text textAlign="center" mt={2} fontWeight="semibold" color="orange.700">
                      {stats.birthdayProgress.toFixed(1)}% completado
                    </Text>
                  </Box>

                  <HStack spacing={4}>
                    <Badge colorScheme="orange" px={3} py={1}>
                      {formatDays(daysUntilBirthday)} para el cumpleaños
                    </Badge>
                    <Badge colorScheme="purple" px={3} py={1}>
                      {formatDays(daysUntilMonthiversary)} para el cumple-mes
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
