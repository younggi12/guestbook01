import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import styles from './Auth.module.scss'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // 로그인 실패시 보여줄 에러메세지
    const [errorMsg, setErrorMsg] = useState('')
    // 로그인 요청중일때 버튼 중복클릭 방지
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const subminFun = async (e) => {
        // form 제출시 자동실행 방지
        e.preventDefault()
        setErrorMsg('')
        setIsLoading(true)

        try {
            // firebase 이메일/패스워드 로그인
            await signInWithEmailAndPassword(auth, email, password)
            // 로그인 성공 -> 방명록 페이지로 이동
            // (App.jsx의 onAuthStateChanged가 자동으로 로그인상태를 감지해서 zustand에 반영함)
            navigate('/guest')
        } catch (error) {
            // firebase 에러코드에 따라 한글 메세지 처리
            console.error('로그인 에러 :', error.code)
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.')
            } else if (error.code === 'auth/invalid-email') {
                setErrorMsg('이메일 형식이 올바르지 않습니다.')
            } else if (error.code === 'auth/too-many-requests') {
                setErrorMsg('너무 많은 시도가 있었습니다. 잠시후 다시 시도해주세요.')
            } else {
                setErrorMsg('로그인에 실패했습니다. 다시 시도해주세요.')
            }
        } finally {
            setIsLoading(false)
        }
    }
  return (
    <section className={styles.auth}>
      <form onSubmit={subminFun} className={styles.card}>
           <div className={styles.brand}>
              <img src="/img/icon3.png" alt="KIA" className={styles.logo} />
           </div>

           <h1>로그인</h1>

           <label className={styles.field}>
              이메일
              <input type="email" value={email} onChange={ (e) => {
                      setEmail(e.target.value)
              }} placeholder='example@email.com' required />
           </label>

           <label className={styles.field}>
              패스워드
              <input type="password" value={password} onChange={ (e) => {
                      setPassword(e.target.value)
              }} placeholder='6글자 이상 입력' required />
           </label>

           {/* 로그인 실패시 에러메세지 표시 */}
           {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

           <button type='submit' className={styles.subminBtn} disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
           </button>
           <p>계정이 없으신가요?{'  '} <Link to='/signup'>회원가입</Link></p>
      </form>
    </section>
  )
}

export default Login