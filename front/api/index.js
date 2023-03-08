import {GET} from "../utils/request";

export const Ping = GET("/ping")

export const User = () => GET("/user")