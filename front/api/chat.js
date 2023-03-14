import {GET} from "../utils/request";

export const Chat = text => GET("/", {
  text
})

export const ChatHistory = start => GET('/chat', {
  start
})