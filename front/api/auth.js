import {POST} from "../utils/request";

export const Login = code => POST("/auth/weapp", {code})