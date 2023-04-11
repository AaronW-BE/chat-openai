import './login.css'
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {LoginApi, RegisterApi} from "../../api/UserApi.js";
export default function LoginView() {
  const [pageType, setPageType] = useState('login');

  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

  const togglePageType = () => {
    if (pageType === 'login') {
      setPageType('register')
    } else {
      setPageType('login')
    }
  }

  // 登录/注册
  const handleAction = () => {
    let api;
    if (pageType === 'login') {
      api = LoginApi;
    } else {
      api = RegisterApi;
    }
    api(formData).then(res => {
      if (api === LoginApi) {
        // 登录成功
        // 保存token
        localStorage.setItem('token', res.token);
        // use react-router-dom redirect api to redirect to home page
        navigate('/');
      } else {
        // 注册成功
        // 跳转到登录页面
        setPageType('login');
      }
    });
  }

  const handleInput = (e) => {
    // check keydown event for enter key then call action and return function
    if (e.keyCode === 13) {
      handleAction();
      return;
    }

    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <div>
      <div className='page-header'>
        {pageType === 'login' ? '登录' : '注册'}
        <b>Wall-E</b></div>
      <div className="form-item">
        <div className="form-item-label">用户名：</div>
        <div>
          <input name="username" onInput={handleInput} />
        </div>
      </div>
      <div className="form-item">
        <div className='form-item-label'>密码</div>
        <div className="">
          <input name="password" type={"password"} onInput={handleInput} onKeyUp={handleInput} />
        </div>
      </div>
      <div className="form-item form-btn-wrp">
        {
          pageType === 'login' ?
            <button className="btn login-btn" onClick={handleAction}>登录</button> :
            <button className="btn login-btn" onClick={handleAction}>注册</button>
        }
        <div>
          {
            pageType === 'login' ?
              <a href="#" onClick={togglePageType}>没有账号, 点击注册</a>
              :
              <a href="#" onClick={togglePageType}>已有账号, 去登录</a>
          }

        </div>
      </div>
    </div>
  );
};
