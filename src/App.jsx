import React, { useEffect } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import useAuthStore from './store/useAuthStore'
import Home from './pages/Home'
import Guestbook from './pages/Guestbook'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Header from './components/Header'
import About from './pages/About'

const App = () => {
  // zustand 스토어에서 로그인상태를 업데이트할 함수들을 꺼내옴
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  // 앱이 처음 실행될때 firebase 로그인상태를 감시(구독) 시작
  // 로그인/로그아웃/새로고침(자동로그인) 될때마다 콜백이 실행되어
  // zustand 스토어에 현재 로그인한 유저정보를 반영함
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 로그인 되어있음
        setUser(firebaseUser)
      } else {
        // 로그인 안되어있음(비회원)
        clearUser()
      }
    })

    // 컴포넌트가 사라질때 구독 해제
    return () => unsubscribe()
  }, [setUser, clearUser])

  return (
    <div>
      <Header />
      <Routes>
        <Route path='/' element= { <Home /> } /> 
        <Route path='/about/' element= { <About /> } /> 
        <Route path='/login' element= { <Login /> } /> 
        <Route path='/signup' element= { <Signup /> } /> 
        <Route path='/guest' element= { <Guestbook />} />
        {/* 만들지 않은 주소로 접근하면 홈으로 이동시킴 */}
        <Route path='*' element= {<Navigate to='/' replace /> } />
      </Routes>
    </div>
  )
}

export default App