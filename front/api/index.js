import {GET, POST} from "../utils/request";

export const Ping = GET("/ping")

export const User = () => GET("/user")

export const GenImage = (desc) => POST("/img", {desc})