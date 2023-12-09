import React from 'react'
import { Navigate, useRoutes } from 'react-router-dom'

import Login from '../components/Login'
import Register from '../components/Register'
import Home from '../views/home'
import ListingsGrid from '../views/home/allListings';
import ListingDetails from '../views/detail'
import UserCenter from '../views/userCenter'
import FavoritesList from '../views/Favorite/favoriteBooks'

const routes = [
  {
    path: '/',
    element: <Home />,
    // 配置子路由
    children: [
      {
        path: '',
        element: <ListingsGrid />
      },
      {
        path: '/userCenter/:username',
        element: <UserCenter />
      },
      {
        path: '/myListings',
        element: <FavoritesList />
      },
      {
        path: '/listing/:listingId',
        element: <ListingDetails />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '*',
    element: <Navigate to='/' />
  },
]

// 使用useRoutes()函数来渲染路由
export default function RouterView () {
  return useRoutes(routes)
}
