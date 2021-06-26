import {
  Page,
  RichTextPropertyValue,
} from "@notionhq/client/build/src/api-types";
import { Client } from "@notionhq/client/build/src";
import * as admin from "firebase-admin";
import { APIResponse, HTTPStatusCode } from "../../typings/api";
import { NextApiRequest } from "next";
import { random } from "../misc";
import axios, { AxiosResponse } from "axios";

export const getFirebaseToken = async (
  auth: string
): Promise<admin.auth.DecodedIdToken> => {
  // const serviceAccount = require("../../../google.env.json");

  // if (!admin.apps.length) {
  //   admin.initializeApp({
  //     credential: admin.credential.cert(serviceAccount),
  //   });
  // }
  // try {
  //   return await admin.auth().verifyIdToken(auth);
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }
  return undefined;
};

export const handleAuth = async <T>(
  req: NextApiRequest,
  callback: (args: { [k: string]: any }) => Promise<APIResponse<T>>,
  args: { [k: string]: any } = {}
): Promise<APIResponse<T>> => {
  const { authorization: auth } = req.headers as { [k: string]: string };

  if (auth === undefined) return { status: HTTPStatusCode.Unauthorized };

  const notion = new Client({ auth: getNotionAPIKey() });

  const pn = auth.startsWith("Basic") ? "Telegram" : "Firebase";
  const key = auth.startsWith("Basic")
    ? auth.split(" ")[1]
    : (await getFirebaseToken(auth.split(" ")[1])).uid;

  if (key === undefined) return { status: HTTPStatusCode.Forbidden };

  const res = await notion.databases.query({
    database_id: "c460fd270be44858a74395684f6e6897",
    filter: {
      property: pn,
      text: {
        equals: key,
      },
    },
  });

  if (res.results.length === 0) return { status: HTTPStatusCode.NotFound };
  else if (res.results.length > 1)
    return { status: HTTPStatusCode.MultipleChoice };

  const content = JSON.parse(
    (res.results[0].properties["Rate Limit"] as RichTextPropertyValue)
      ?.rich_text[0]?.plain_text ?? "[]"
  );

  const now = new Date().getTime();
  if (content[0] === undefined || content[0] + 30000 < now) {
    // 100 requests per 30 s
    content[0] = now;
    content[1] = 1;
  } else {
    content[1]++;
    if (content[1] > 100) return { status: HTTPStatusCode.TooManyRequests };
  }

  // const upd = await notion.pages.update({
  //   page_id: res.results[0].id,
  //   properties: {
  //     "Rate Limit": {
  //       type: "rich_text",
  //       rich_text: [
  //         {
  //           type: "text",
  //           text: {
  //             content: JSON.stringify(content),
  //           },
  //         },
  //       ],
  //     },
  //   },
  // });

  return callback({ user: res.results[0] as Page, notion, ...args });
};

export const getNotionAPIKey = (): string => {
  return process.env[`NOTION_API_KEY${random(1, 6)}`];
};

export const get = async (
  url: string,
  token: string
): Promise<AxiosResponse<any>> => {
  const config = url.startsWith("/api/v1")
    ? {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    : {};

  return await axios.get(url, config);
};

export const post = async (
  url: string,
  token: string,
  body: string
): Promise<AxiosResponse<any>> => {
  const config = url.startsWith("/api/v1")
    ? {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    : {};

  return await axios.post(url, body, config);
};
