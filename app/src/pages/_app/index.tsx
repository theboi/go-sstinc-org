import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { AppProps } from "next/app";
import "./styles.scss";
import "./cssreset.scss";
import Head from "next/head";
import NextLink from "next/link";

import {
  Box,
  Center,
  ChakraProvider,
  Code,
  Heading,
  Link as ChakraLink,
  Text,
  useToast,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import style from "./style.module.css";

import theme from "../../theme";

import { UserRole } from "../../objects/user";
import ErrorPage from "../404";
import { AuthProvider, useAuth } from "../../services/auth";
import NavBar from "../../components/_app/navBar";
import { Credits } from "../../components/_app/credits";
import { SWRConfig } from "swr";
import axios from "axios";
import { useColor } from "../../hooks/color";

export const authPaths: { [key: string]: UserRole } = {
  "/url": UserRole.ExCo,
  "/train": UserRole.Trainee,
};

export default function _App(props: AppProps) {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <AuthProvider>
        <App {...props} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const { auth, user } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [hostname, setHostname] = useState<string>();

  useEffect(() => {
    if (globalThis) setHostname(globalThis.location.hostname);
  }, [globalThis.location]);

  useEffect(() => {
    onOpen();
    (async () => {
      await auth.checkForAuth();
      onClose();
    })();
  }, []);

  return (
    <>
      <Head>
        <title>SST Inc Management Platform</title>
        <meta property="og:title" content="SST Inc Management Platform" />
        <meta property="og:image" content="/assets/sstinc-icon.png" />
        <meta property="og:description" content="SST Inc Management Platform" />
        <meta property="og:url" content="go.sstinc.org" />
        <meta name="twitter:card" content="/assets/sstinc-icon.png" />
      </Head>
      {hostname === "go.sstinc.org" && (
        <Center
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bgColor: useColor("bg1"),
            zIndex: 9999,
            height: "100vh",
          }}
        >
          <Heading size="lg">
            Please use{" "}
            <Code size="lg" colorScheme="blue">
              <NextLink href="https://smp.sstinc.org">
                <ChakraLink>smp.sstinc.org</ChakraLink>
              </NextLink>
            </Code>{" "}
            instead.
          </Heading>
        </Center>
      )}
      <AppScaffold>
        <div className={style.content}>
          {(() => {
            switch (true) {
              case authPaths[router.pathname] === undefined:
                return <Component {...pageProps} />;
              // case user?.role === undefined:
              //   return <ProfilePage />;
              case user?.role >= authPaths[router.pathname]: // isAuth
                return <Component {...pageProps} />;
              default:
                return <ErrorPage status={403} />;
            }
          })()}
          <Modal
            size="xs"
            onClose={onClose}
            isOpen={isOpen}
            isCentered
            closeOnEsc={false}
            closeOnOverlayClick={false}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalBody>
                <Center height={100}>
                  <Spinner size="xl" />
                </Center>
              </ModalBody>
            </ModalContent>
          </Modal>
        </div>
      </AppScaffold>
    </>
  );
}

const AppScaffold = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast();
  const linkColor = useColor("link");
  const swrConfig = {
    fetcher: async (url: string) => {
      const res = await axios.get(url);
      if (!(res.status >= 200 && res.status <= 299)) {
        throw Error("A network error occurred");
      }
      return res.data;
    },
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (error.status === 404) return; // Never retry on 404.
      if (retryCount >= 3) return; // Only retry up to 3 times.
      setTimeout(() => revalidate({ retryCount }), 5000); // Retry after 5 seconds.
    },
    onError: (error, key) => {
      console.log(error);
      if (
        error.status !== 403 &&
        error.status !== 404 &&
        !toast.isActive(key)
      ) {
        toast({
          id: key,
          title: `An error occurred`,
          description: (
            <Text>
              {error.message}. If this is a breaking issue, please help us by
              filing a bug report on{" "}
              <ChakraLink
                href="https://github.com/theboi/smp-sstinc-org/issues"
                target="_blank"
                color={linkColor}
              >
                GitHub
              </ChakraLink>{" "}
              😣
            </Text>
          ),
          status: "error",
          duration: 7000,
          isClosable: true,
          position: "bottom-left",
          variant: "left-accent",
        });
      }
    },
  };

  return (
    <SWRConfig value={swrConfig}>
      <NavBar />
      {children}
      <Credits />
    </SWRConfig>
  );
};
