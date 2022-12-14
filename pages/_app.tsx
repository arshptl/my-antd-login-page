import React from "react";
import { AppProps } from "next/app";
require("antd/dist/antd.less");

import {
  EventType,
  PublicClientApplication,
  AccountInfo,
  EventPayload,
  SilentRequest,
} from "@azure/msal-browser";

import { MsalProvider, useIsAuthenticated, useMsal } from "@azure/msal-react";
// import axios, { AxiosRequestConfig } from 'axios'
import { loginRequest, msalInstance } from "../src/config";

import { Refine } from "@pankod/refine-core";
import { notificationProvider, ErrorComponent } from "@pankod/refine-antd";
import routerProvider from "@pankod/refine-nextjs-router";
import dataProvider from "@pankod/refine-simple-rest";
require("antd/dist/antd.less");
import LoginPage from "./login";

import {
  Title,
  Header,
  Sider,
  Footer,
  Layout,
  OffLayoutArea,
} from "@components/layout";
import { PostList, PostCreate, PostEdit, PostShow } from "@components/posts";
import { API_URL } from "../src/constants";
import { UserData } from "../src/components/user";
import axios, { AxiosRequestConfig } from "axios";
import { authProvider } from "src/authProvider";

export const TOKEN_KEY = "refine-auth";
export const axiosInstance = axios.create();
// const msalInstance = new PublicClientApplication(msalConfig)

msalInstance.addEventCallback(async (event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    const payload: EventPayload = event.payload;
    msalInstance.setActiveAccount(payload as AccountInfo);

    let account = msalInstance.getActiveAccount();

    const request: SilentRequest = {
      ...loginRequest,
      account: account!,
    };
    try {
      // Silently acquires an access token which is then attached to a request for API access
      const response = await msalInstance.acquireTokenSilent(request);
      console.log("Fetching access token: success");
      console.log("Scopes", response.scopes);
      console.log("Token Type", response.tokenType);

      localStorage.setItem(TOKEN_KEY, response.accessToken);
    } catch (e) {
      msalInstance.acquireTokenPopup(request).then((response) => {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
      });
    }
  }
});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <MsalProvider instance={msalInstance}>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider(API_URL, axiosInstance)}
        notificationProvider={notificationProvider}
        Title={Title}
        Header={Header}
        Sider={Sider}
        Footer={Footer}
        Layout={Layout}
        OffLayoutArea={OffLayoutArea}
        authProvider={authProvider}
        LoginPage={LoginPage}
        resources={[
          {
            name: "user",
            list: UserData,
          },
          {
            name: "posts",
            list: PostList,
            create: PostCreate,
            edit: PostEdit,
            show: PostShow,
          },
        ]}
        catchAll={<ErrorComponent />}
      >
        <Component {...pageProps} />
      </Refine>
    </MsalProvider>
  );
}

export default MyApp;
