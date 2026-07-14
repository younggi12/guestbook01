import React from 'react'
import {Link, NavLink, useNavigate} from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import useAuthStore from '../store/useAuthStore'
import styles from './Header.module.scss'

const Header = () => {
  const navigate = useNavigate()
  // zustand에서 현재 로그인한 유저정보를 가져옴 (로그인 안했으면 null)
  const user = useAuthStore((state) => state.user)

  // 로그아웃 버튼 클릭시 실행
  const logoutFnc = async () => {
    try {
      await signOut(auth)
      // 로그아웃 성공 -> zustand 상태는 App.jsx의 onAuthStateChanged가 자동으로 처리함
      navigate('/')
    } catch (error) {
      console.error('로그아웃 에러 :', error)
    }
  }

  return (
    <header className={styles.header}>
        <div className={styles.inner}>
            <Link to="/" className={styles.logo}>
              <img src="/img/logo1.jpg" alt="logo" className={styles.logoImg} />
            </Link>
            <nav className={styles.nav}>
                <NavLink to='/' end className={ ({ isActive }) => (
                   isActive ? styles.active : styles.navLink
                )}>홈으로</NavLink>

                <NavLink to='/guest' className={ ({ isActive }) => (
                   isActive ? styles.active : styles.navLink
                )}>방명록</NavLink>
            </nav>
            <div className={styles.auth}>
              {
                user ? (
                  // 로그인한 상태 : 닉네임 + 로그아웃 버튼 표시
                  <>
                    <span className={styles.userName}>{user.displayName || user.email}님</span>
                    <button type='button' className={styles.logout} onClick={logoutFnc}>로그아웃</button>
                  </>
                ) : (
                  // 비회원 상태 : 로그인 / 회원가입 링크 표시
                  <>
                    <Link to="/login" className={styles.login}>로그인</Link>
                    <Link to="/signup" className={styles.signup}>회원가입</Link>
                  </>
                )
              }
            </div>
        </div>
    </header>
  )
}

export default Header