import './login.css'
import {Link} from "react-router-dom";
export default function LoginView() {
  return (
    <div>
      <div className='page-header'>Login <b>Wall-E</b></div>
      <div className="form-item">
        <div className="form-item-label">用户名：</div>
        <div>
          <input name="username" />
        </div>
      </div>
      <div className="form-item">
        <div className='form-item-label'>密码</div>
        <div className="">
          <input name="password" type={"password"} />
        </div>
      </div>
      <div className="form-item form-btn-wrp">
        <button className="btn login-btn">登录</button>
        <a href=>没有账号, 注册</a>
      </div>h
    </div>
  );
};