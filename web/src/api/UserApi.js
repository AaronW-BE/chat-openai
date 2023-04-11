import {Api} from "./index.js";

/**
 * 登录
 * @param params
 * @returns {*}
 */
export const LoginApi = (params) => Api.Post('/auth/common/login', params);

/**
 * 注册
 * @param params
 * @returns {*}
 */
export const RegisterApi = (params) => Api.Post('/auth/common/register', params);
