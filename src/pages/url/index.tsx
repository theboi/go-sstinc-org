import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import style from './style.module.css'
import { User, UserRole } from '../../model/user';
import ThemeButton from '../../components/button';

let deepLinkField = "";
let nameField = "";
let suffixField = "";

export default function UrlPage(props: {user: User}) {
  const router = useRouter();

  const [adminErrorMsg, setAdminErrorMsg] = useState(``);

  let deepLinkFieldRef = useRef(null);
  let suffixFieldRef = useRef(null);
  let createLinkButtonRef = useRef(null);

  nameField = suffixField = deepLinkField = "";

  useEffect(() => {
    if (props.user?.role != UserRole.Admin) console.log("oop")
  }, [props.user])
  
  function createUrl() {async () => {
    if (nameField === "" || deepLinkField === "") {
      setAdminErrorMsg(`Please fill in all required fields.`);
      return;
    } else if (
      (await firebase
        .firestore()
        .collection("links")
        .get()
        .then((col) => {
          for (const doc of col.docs) {
            if (suffixField === doc.data().suffix) {
              return true;
            }
          }
          return;
        })) === true
    ) {
      setAdminErrorMsg(`This link is already in use.`);
      return;
    } else if (
      deepLinkField.search(
        /(http|https):\/\/([a-zA-Z0-9][a-zA-Z0-9-]{0,}\.){1,}[a-zA-Z0-9]{2,}/
      )
    ) {
      setAdminErrorMsg(`Invalid deep/long link provided`);
      return;
    } else if (
      deepLinkField.includes(window.location.href) ||
      deepLinkField.includes("bit.ly") ||
      deepLinkField.includes("tinyurl.com") ||
      deepLinkField.includes("goo.gl")
    ) {
      setAdminErrorMsg(`Site blacklisted`);
      return;
    } else if (
      deepLinkField.includes("dQw4w9WgXcQ") ||
      deepLinkField.includes("ub82Xb1C8os") ||
      deepLinkField.includes("8ybW48rKBME")
    ) {
      window.location.href =
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      return;
    }

    const genRandAlias = () => {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";
      let randomAlias = "";
      for (var i = 0; i < 4; i++) {
        randomAlias += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      firebase
        .firestore()
        .collection("links")
        .get()
        .then((col) => {
          col.docs.map((doc) => {
            if (randomAlias === doc.data().suffix) {
              return genRandAlias();
            }
          });
        });
      return randomAlias;
    };

    if (authAdmins.includes(firebase.auth().currentUser.email)) {
      const newRandomAlias = genRandAlias();
      firebase
        .firestore()
        .collection(`links`)
        .doc(suffixField || newRandomAlias)
        .set({
          name: nameField ?? "ERROR",
          link: deepLinkField ?? "ERROR",
          suffix: suffixField || newRandomAlias,
          date: firebase.firestore.Timestamp.fromDate(new Date()),
        })
        .then(() => {
          createdSuffix = suffixField || newRandomAlias;
          console.log(
            `Successful document written with ID: ${suffixField}`
          );
          router.push(`/success`);
        })
        .catch((error) => {
          console.error(`Error adding document: ${error}`);
        });
    }
  }}

  return (
    <div className={style.main}>
      <h3>Create a new Link</h3>
      <div className={style.newFieldDiv}>
        <label htmlFor="shortenerName">NAME*</label>
        <input
          id="shortenerName"
          type="text"
          placeholder="SST Inc Website"
          onChange={(event) => {
            nameField = event.target.value;
          }}
          onKeyUp={(event) => {
            if (event.keyCode === 13) {
              event.preventDefault();
              deepLinkFieldRef.current.focus();
            }
          }}
        />
        <label htmlFor="shortenerLink">LONG URL*</label>
        <input
          ref={deepLinkFieldRef}
          id="shortenerLink"
          type="text"
          placeholder="https://sstinc.org"
          onChange={(event) => {
            deepLinkField = event.target.value;
          }}
          onKeyUp={(event) => {
            if (event.keyCode === 13) {
              event.preventDefault();
              suffixFieldRef.current.focus();
            }
          }}
        />
        <label htmlFor="shortenerSuffix">SHORT URL</label>
        <div className={style.shortUrlDiv}>
          <p className={style.domain}>go.sstinc.org/</p>
          <input
            ref={suffixFieldRef}
            id="shortenerSuffix"
            type="text"
            placeholder="sstinc"
            onChange={(event) => {
              suffixField = event.target.value;
            }}
            onKeyUp={(event) => {
              if (event.keyCode === 13) {
                event.preventDefault();
                createLinkButtonRef.current.click();
              }
            }}
          />
        </div>
        <p className={style.smallText}>
          Leaving the field empty would create a randomly generated alias.
        </p>
      </div>
      {adminErrorMsg !== `` ? (
        <div className={style.errorMsg}>
          <FaExclamationCircle />
          <p>{adminErrorMsg}</p>
        </div>
      ) : (
        <></>
      )}
      <ThemeButton onClick={createUrl} ref={createLinkButtonRef}>Create</ThemeButton>
      <div className={style.statusOverlay}></div>
    </div>
  );
}