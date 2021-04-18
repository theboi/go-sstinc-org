import { ReactNode, useEffect, useRef, useState } from "react";
import * as React from "react";
import { AppProps } from "next/app";
import "./styles.css";
import style from "./style.module.css";
import Head from "next/head";

import theme from "../../model/theme";
import {
  Avatar,
  Box,
  Button,
  ChakraProvider,
  IconButton,
  Text,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import {
  FaBars,
  FaBug,
  FaClipboardList,
  FaHome,
  FaLink,
  FaSignInAlt,
  FaSignOutAlt,
  FaSun,
  FaTimes,
} from "react-icons/fa";
import { fbProvider } from "../../model/fbProvider";
import { User, UserRole } from "../../model/user";
import { useRouter } from "next/router";
import ErrorPage from "../404";
import ProfilePage from "../profile";

const paths: { [key: string]: UserRole } = {
  "/url": UserRole.ExCo,
  "/urls": UserRole.ExCo,
  "/atd": UserRole.Trainee,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  let loadingOverlayRef = useRef(null);

  const [user, setUser] = useState<User>(null);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    if (window) {
      setHostname(window.location.hostname);
    }
  });
  useEffect(() => {
    fbProvider.auth.addIdTokenChangedListener((user: User) => {
      setUser(user);
      // console.log(user)
      // if (user?.iid !== undefined && user?.role === UserRole.Alien) {
      //   router.replace('/update')
      // }
    });
  }, []);

  useEffect(() => {
    (async () => {
      await fbProvider.auth.checkForAuth();
      loadingOverlayRef.current.style.display = "none";
    })();
  }, [user]);

  function isAuth(): boolean {
    if (user?.role >= paths[router.pathname]) return true;
    else return false;
  }

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
      <ChakraProvider theme={theme}>
        {hostname === "go.sstinc.org" || hostname === "qr.sstinc.org" ? (
          <div className={style.alert}>
            <p>
              <code>go.sstinc.org</code> and <code>qr.sstinc.org</code> will
              cease operation beginning June 2021. Please use the new unified{" "}
              <a href="https://smp.sstinc.org">
                <code>smp.sstinc.org</code>
              </a>{" "}
              instead.
            </p>
          </div>
        ) : null}
        <AppScaffold user={user}>
          <div className={style.content}>
            {(() => {
              if (paths[router.pathname] === undefined)
                return <Component {...pageProps} user={user} />;
              else if (user?.role === undefined)
                return <ProfilePage user={user} />;
              else if (isAuth())
                return <Component {...pageProps} user={user} />;
              else return <ErrorPage status={403} />;
            })()}
            <LoadingOverlay ref={loadingOverlayRef} />
          </div>
        </AppScaffold>
      </ChakraProvider>
    </>
  );
}

const Credits = () => (
  <Text className={style.credits} color="">
    Made with ♥&#xFE0E; by{" "}
    <a href="https://www.ryanthe.com" target="_blank" className={style.link}>
      Ryan The
    </a>{" "}
    from SST Inc, 2021, v2.1.0. <br />
    Open sourced on{" "}
    <a
      href="https://github.com/theboi/smp-sstinc-org"
      target="_blank"
      className={style.link}
    >
      GitHub
    </a>
    .{" "}
  </Text>
);

const LoadingOverlay = React.forwardRef(
  (_, ref: React.MutableRefObject<HTMLDivElement>) => (
    <Box ref={ref} className={style.loadingOverlay}>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        display="block"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          stroke="#00a4ff"
          strokeWidth="10"
          r="35"
          strokeDasharray="164.93361431346415 56.97787143782138"
          transform="rotate(287.844 50 50)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="1s"
            values="0 50 50;360 50 50"
            keyTimes="0;1"
          />
        </circle>
      </svg>
    </Box>
  )
);

const AppScaffold = (props: { children: ReactNode; user: User }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <div className={style.main}>
      <div className={style.headnav}>
      <a href="https://sstinc.org" rel="noreferrer noopener" target="_blank">
        <img
          src="/assets/sstinc-icon.png"
          alt="SST Inc Icon"
          width={100}
          height={100}
        />
      </a>
      <nav className={style.nav}><NavBar
        user={props.user}
        links={[
          {
            name: props.user === null ? "Sign In" : props.user.displayName,
            icon:
              props.user === null ? (
                <FaSignInAlt />
              ) : (
                <Avatar src={props.user?.photoURL} size="sm" />
              ),
            action: props.user === null ? fbProvider.auth.signIn : "/profile",
          },
          {
            name: "Attendance",
            icon: <FaClipboardList />,
            action: "/atd",
          },
          {
            name: "URL Shortener",
            icon: <FaLink />,
            action: "/urls",
          },
          {
            name: "Toggle Theme",
            icon: <FaSun />,
            action: () => toggleColorMode(),
          },
          {
            name: "Bug Report",
            icon: <FaBug />,
            action: "https://github.com/theboi/smp-sstinc-org/issues",
          },
        ]}
      /></nav>
      </div>
      <Box
        boxShadow={colorMode === "dark" ? "dark-lg" : "lg"}
        border="1px solid"
        borderColor={colorMode === "dark" ? "transparent" : "gray.200"}
        rounded="2xl"
        p={2}
        m={2}
      >
        {props.children}
      </Box>
      <Credits />
    </div>
  );
};

interface NavLink {
  name: string;
  icon: React.ReactElement<any, string | React.JSXElementConstructor<any>>; // Allows for any FontAwesome icon or other React element like images
  action: (() => void) | string;
}

const NavBar = (props: { user: User; links: NavLink[] }) => {
  const router = useRouter();

  return (
    <Menu placement="bottom-end">
      <MenuButton
        boxSize="60px"
        style={{ borderRadius: 100 }}
        as={IconButton}
        aria-label="Menu"
        icon={<Avatar src={props.user?.photoURL} size="md" />}
        variant="outline"
      />
      <MenuList>
        {props.links.map((e, i) => (
          <MenuItem
            key={i}
            onClick={
              typeof e.action == "string" || e.action instanceof String
                ? () => router.push(e.action as string)
                : e.action
            }
            icon={e.icon}
          >
            {e.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};