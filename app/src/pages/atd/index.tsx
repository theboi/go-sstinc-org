import { KeyboardEvent, useEffect, useState } from "react";

import hash from "crypto-js/sha256";

import { FaKey } from "react-icons/fa";
import {
  Button,
  IconButton,
  ButtonGroup,
  Heading,
  PinInputField,
  PinInput,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Code,
  VStack,
} from "@chakra-ui/react";

import { User, UserRole } from "../../model/user";
import { fbProvider } from "../../model/fbProvider";

import style from "./style.module.css";

export default function AtdPage(props: { user: User }) {
  const [time, setTime] = useState(0);
  const [key, setKey] = useState(getKeyCode());
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Confirm");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const interval = setInterval(() => {
      const epochSeconds = Math.floor(new Date().getTime() / 1000);
      setTime(epochSeconds % 20);
      return setKey(getKeyCode());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function onCodeChange(s: string) {
    setCode(s.toUpperCase());
  }

  function getKeyCode() {
    const epochSeconds = new Date().getTime() / 1000;
    return hash(`sstinc${epochSeconds - (epochSeconds % 20)}`)
      .toString()
      .slice(0, 4)
      .toUpperCase();
  }

  function confirmCode() {
    if (code === getKeyCode()) {
      /** Handle after writing to Firestore */
      fbProvider.atd
        .checkIn(props.user)
        .then(() => {
          setStatus("Success");
        })
        .catch((e) => {
          console.error(e);
          setStatus("Error");
        })
        .finally(() => {
          setTimeout(() => {
            setStatus("Confirm");
          }, 2000);
        });
    } else {
      /** Code submission cooldown of 2 sec, informs user that code is incorrect */
      setStatus("Invalid");
      setCode("");
      setTimeout(() => {
        setStatus("Confirm");
      }, 2000);
    }
  }

  function onCodeKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode === 13 && code.length === 4) confirmCode();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pt={10} pb={10}>
            <VStack>
              <Heading size="sm">
                Enter this code at{" "}
                <Code colorScheme="blue">smp.sstinc.org</Code>
              </Heading>
              <HStack>
                <PinInput type="alphanumeric" value={key} size="" isDisabled>
                  {[...Array(4)].map((e, i) => (
                    <PinInputField
                      style={{
                        fontSize: "2em",
                        opacity: 1,
                        borderColor: "unset",
                      }}
                      key={i}
                    />
                  ))}
                </PinInput>
                <CircularProgress value={time} max={20}>
                  <CircularProgressLabel fontSize="lg">
                    {20 - time}
                  </CircularProgressLabel>
                </CircularProgress>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className={style.main}>
        <Heading size="md">Attendance</Heading>
        <p>
          Kindly enter the 4 digit code provided to check-in to SST Inc. Your
          attendance data will be recorded in the SST Inc Attendance Database
          (SAD).
        </p>
        <HStack onKeyDown={onCodeKeyDown}>
          <PinInput
            otp
            type="alphanumeric"
            size="xl"
            onChange={onCodeChange}
            isInvalid={status === "Invalid"}
          >
            {[...Array(4)].map((_, i) => (
              <PinInputField style={{ fontSize: "2em" }} key={i} />
            ))}
          </PinInput>
        </HStack>
        <div className={style.buttons}>
          <ButtonGroup isAttached width="100%">
            <Button
              isFullWidth
              onClick={confirmCode}
              disabled={status !== "Confirm" || code.length !== 4}
              colorScheme={
                { Error: "red", Invalid: "red", Success: "green" }[status] ??
                "blue"
              }
            >
              {status}
            </Button>
            {props.user?.role >= UserRole.ExCo ? (
              <IconButton
                onClick={onOpen}
                aria-label="View Key Code"
                icon={<FaKey />}
              />
            ) : null}
          </ButtonGroup>
        </div>
        {/* <Button disabled>Scan a QR Code instead</Button> */}
      </div>
    </>
  );
}
