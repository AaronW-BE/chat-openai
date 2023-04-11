import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ChatView from "./views/chat/index.jsx";
import LoginView from "./views/login/LoginView.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: 'chat',
    element: <ChatView />
  },
  {
    path: 'login',
    element: <LoginView />
  },
  {
    path: '*',
    element: <div>Not Found</div>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
