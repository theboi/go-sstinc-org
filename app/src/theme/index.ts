import { extendTheme } from "@chakra-ui/react";
import components from "./components";

export default extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  styles: {
    global: (props) => ({
      // "html, body": {
      //   fontSize: "sm",
      //   color: props.colorMode === "dark" ? "white" : "gray.600",
      //   lineHeight: "tall",
      // },
      // a: {
      //   color: props.colorMode === "dark" ? "teal.300" : "teal.500",
      // },
      div: {
        borderRadius: 8,
      },
    }),
  },
  colors: {
    // black: "#0D1821",
    // white: "#D8D4F2",
  },
  components: components,
});
