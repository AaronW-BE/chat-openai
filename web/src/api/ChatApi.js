import {Api} from "./index.js";

export const SendChatApi = (message) => Api.Get("/", {text: message});

export const ChatHistoryApi = (params) => Api.Get("/chat", params);