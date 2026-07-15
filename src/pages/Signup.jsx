import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import useAuthStore from '../store/useAuthStore'
import styles from './Auth.module.scss'

const Signup = () => {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // 회원가입 실패시 보여줄 에러메세지
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  // 닉네임 반영을 위해 zustand의 setUser를 직접 호출
  const setUser = useAuthStore((state) => state.setUser)

  const subminFun = async (e) => {
        // form 제출시 자동실행 방지
        e.preventDefault()
        setErrorMsg('')
        setIsLoading(true)

        try {
            // firebase 이메일/패스워드로 계정 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)

            // 방금 만든 계정에 닉네임(displayName) 저장
            await updateProfile(userCredential.user, { displayName: nickname })

            // updateProfile은 즉시 auth 상태변화 이벤트를 안일으킬수 있어서
            // 닉네임이 반영된 최신 유저정보를 zustand에 직접 반영해줌
            setUser(auth.currentUser)

            // 가입 성공 -> 방명록 페이지로 이동
            navigate('/guest')
        } catch (error) {
            console.error('회원가입 에러 :', error.code)
            if (error.code === 'auth/email-already-in-use') {
                setErrorMsg('이미 사용중인 이메일입니다.')
            } else if (error.code === 'auth/invalid-email') {
                setErrorMsg('이메일 형식이 올바르지 않습니다.')
            } else if (error.code === 'auth/weak-password') {
                setErrorMsg('비밀번호는 6자리 이상이어야 합니다.')
            } else {
                setErrorMsg('회원가입에 실패했습니다. 다시 시도해주세요.')
            }
        } finally {
            setIsLoading(false)
        }
    }
  return (
    <section className={styles.auth}>
       <form onSubmit={subminFun} className={styles.card}>
                <div className={styles.brand}>
                  <img src="/img/logo9.png" alt="KIA" className={styles.logo} />
                  <h1>회원가입</h1>
              </div>

              <label className={styles.field}>
                  닉네임
                    <input type="text" value={nickname} onChange={ (e) => {
                      setNickname(e.target.value)
                    }} placeholder='사용할 이름' maxLength="20" required />
              </label>

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
                    }} placeholder='6글자 이상 입력' minLength="6" required />
              </label>

              {/* 회원가입 실패시 에러메세지 표시 */}
              {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

              <button type='submit' disabled={isLoading}>
                {isLoading ? '가입 중...' : '가입하기'}
              </button>
              <p>계정이 있나요?{'  '} <Link to='/login'>로그인</Link></p>
       </form>
    </section>
  )
}

export default Signup