/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import {
  Box,
  Text,
  Button,
  Center,
  useToast,
  SlideFade,
} from "@chakra-ui/react";
import useLoginStreakController from "./useLoginStreakController";

interface WelcomeBackProps {
  userId: string;
}

export default function WelcomeBack(props: WelcomeBackProps) {
  const duration = 30000; // Duration in milliseconds
  const {
    welcomeVisible,
    loginStreak,
    dailyBonus,
    handleCloseWelcome,
  } = useLoginStreakController({duration: duration, userId: props.userId});
  const toast = useToast();

  if (!welcomeVisible) {
    return null;
  }
  return (
    <SlideFade in={welcomeVisible} offsetY="20px">
      <Center position="fixed" top={0} left={0} right={0} zIndex={1000}>
        <Box
          p={4}
          borderRadius="md"
          bg="teal.500"
          color="white"
          textAlign="center"
        >
          <Text fontSize="xl">
            Welcome back! You're on a {loginStreak}-day login streak!
          </Text>
          <Text fontSize="sm">
            You've earned {dailyBonus} coins for logging in today.
          </Text>
          <Button
            mt={2}
            colorScheme="teal"
            variant="outline"
            onClick={() => {
              handleCloseWelcome();
              toast({
                title: "Welcome back!",
                description: "Enjoy your day!",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
              });
            }}
          >
            Close
          </Button>
        </Box>
      </Center>
    </SlideFade>
  );
};
