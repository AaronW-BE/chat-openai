import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import ChatView from "./views/chat/index.jsx";
import LoginView from "./views/login/LoginView.jsx";
import HomeView from "./views/home/HomeView.jsx";
import {ChatHistoryApi} from "./api/ChatApi.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: () => {
      if (!localStorage.getItem('token')) {
        return redirect('/login');
      }
      return null
    },
    children: [
      {
        index: true,
        element: <HomeView />
      },
      {
        path: 'chat',
        element: <ChatView />,
        loader: () => {
          // obtain history chat msg
          return new Promise((resolve) => {
            ChatHistoryApi().then(result => {
              resolve(result);
            }).catch(() => {
              resolve([])
            });
          })
        }
      },
    ]
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
