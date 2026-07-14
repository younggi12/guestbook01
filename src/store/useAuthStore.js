// zustand를 이용한 로그인 상태관리 스토어
// firebase auth의 로그인 상태(onAuthStateChanged)를 App.jsx에서 구독해서
// 이 스토어에 반영함 -> 앱 어디서든 useAuthStore()로 로그인 정보를 꺼내씀
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // 현재 로그인한 firebase user 객체 (로그인 안했으면 null)
  user: null,

  // firebase가 최초 로그인상태를 확인하는 중인지 여부
  // (새로고침 직후 깜빡임(로그인 버튼 -> 유저정보) 방지용)
  isLoading: true,

  // 로그인 성공 / 새로고침시 로그인 유지될 때 실행
  setUser: (user) => set({ user, isLoading: false }),

  // 로그아웃 시 실행
  clearUser: () => set({ user: null, isLoading: false }),
}))

export default useAuthStore