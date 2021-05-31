import {
  Heading,
  Box,
  Center,
  Image,
  HStack,
  Stack,
  Text,
  Button,
  Link,
} from "@chakra-ui/react";
import style from "./style.module.css";

const HomePage = () => {
  return (
    <Box>
      <Header />
      <Body />
      <SignUp />
    </Box>
  );
};

const Header = () => {
  return (
    <Box mt={2} mb={20}>
      <Center>
        <Box>
          <Box mb={5}>
            <Text fontSize={"4xl"}>
              <b>SST Inc. Management Platform</b>
            </Text>
            <Text fontSize={"2xl"}>Manage, Learn, Develop</Text>
          </Box>
          <Stack direction={"row"} spacing={4}>
            <Link to={"/home"}>
              <Button colorScheme={"teal"} size={"md"}>
                Management
              </Button>
            </Link>
            <Link to={"/home"}>
              <Button colorScheme={"teal"} size={"md"}>
                Learn
              </Button>
            </Link>
          </Stack>
        </Box>
      </Center>
    </Box>
  );
};

const Body = () => {
  const content = [
    {
      id: 1,
      img: "https://placekitten.com/300/300",
      imgAlt: "Kitten",
      title: "Placeholder",
      desc: "Placeholder Description",
    },
  ];
  return (
    <Box>
      {content.map((bodyContent) => (
        <BodyItem bodyContent={bodyContent} key={bodyContent.id} />
      ))}
    </Box>
  );
};

const BodyItem = ({ bodyContent }) => {
  return (
    <Box overflow={"hidden"} mb={"4"}>
      <HStack spacing={"50px"}>
        <Box>
          <Image
            src={bodyContent.img}
            alt={bodyContent.imgALt}
            borderRadius={"5px"}
          />
        </Box>
        <Box>
          <Heading>
            <b>{bodyContent.title}</b>
          </Heading>
          <Text fontSize={"md"}>{bodyContent.desc}</Text>
        </Box>
      </HStack>
    </Box>
  );
};

const SignUp = () => {
  return (
    <Box
      boxShadow={"base"}
      p={"6"}
      rounded={"md"}
      borderWidth={"1px"}
      borderRadius={"lg"}
      overflow={"hidden"}
      mb={5}
    >
      <Text fontSize={"3xl"}>
        <b>Sign Up</b>
      </Text>
      <Center></Center>
    </Box>
  );
};

export default HomePage;