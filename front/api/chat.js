import {GET} from "../utils/request";

export const Chat = text => GET("/", {
  text
})