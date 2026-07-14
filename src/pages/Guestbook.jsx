import React, {useState, useEffect} from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import useAuthStore from '../store/useAuthStore'
import GuestbookForm from '../components/GuestbookForm'
import CharacterAvatar from '../components/CharacterAvatar'
import styles from './Guestbook.module.scss'

const Guestbook = () => {
  const [post, setPost] = useState([])
  // 최초 목록을 firestore에서 불러오는중인지 여부
  const [isLoading, setIsLoading] = useState(true)

  // 수정중인 게시글 id (수정중이 아니면 null)
  const [editingId, setEditingId] = useState(null)
  // 수정중인 내용(메세지)을 담는 임시 state
  const [editMessage, setEditMessage] = useState('')

  // zustand에서 현재 로그인한 유저정보를 가져옴
  const user = useAuthStore((state) => state.user)

  // 방명록 목록 실시간 구독
  // firestore의 'guestbook' 컬렉션을 작성일 내림차순(최신글 먼저)으로 정렬해서 가져옴
  useEffect(() => {
    const guestbookQuery = query(
      collection(db, 'guestbook'),
      orderBy('createdAt', 'desc')
    )

    // onSnapshot : 실시간 구독 -> 글이 추가/수정/삭제 될때마다 자동으로 목록 갱신됨
    const unsubscribe = onSnapshot(guestbookQuery, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      setPost(list)
      setIsLoading(false)
    })

    // 컴포넌트가 사라질때 구독 해제
    return () => unsubscribe()
  }, [])

  // 글 작성 (회원만 호출 가능 - 아래 렌더링에서 비회원에게는 폼 자체를 숨김)
  const addPostFnc = async (fromData) => {
      if (!user) return

      try {
        await addDoc(collection(db, 'guestbook'), {
          nickname: fromData.nickname,
          message: fromData.message,
          character: fromData.character,
          // 작성자 확인용 - 본인 글만 수정/삭제 가능하게 하기 위해 저장
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: null,
        })
      } catch (error) {
        console.error('글 작성 에러 :', error)
        alert('글 작성에 실패했습니다. 다시 시도해주세요.')
      }
  }

  // 글 삭제 (작성자 본인만 가능)
  const deleFun = async (item) =>{
      // 작성자 본인이 아니면 삭제 불가
      if (!user || item.authorUid !== user.uid) {
        alert('본인이 작성한 글만 삭제할 수 있습니다.')
        return
      }

      const delv = window.confirm("정말 삭제하시나요?")
      if(!delv) return

      try {
        await deleteDoc(doc(db, 'guestbook', item.id))
      } catch (error) {
        console.error('글 삭제 에러 :', error)
        alert('삭제에 실패했습니다. 다시 시도해주세요.')
      }
  }

  // 수정 시작 (작성자 본인만 가능)
  const editStartFnc = (item) => {
    if (!user || item.authorUid !== user.uid) {
      alert('본인이 작성한 글만 수정할 수 있습니다.')
      return
    }
    setEditingId(item.id)
    setEditMessage(item.message)
  }

  // 수정 취소
  const editCancelFnc = () => {
    setEditingId(null)
    setEditMessage('')
  }

  // 수정 저장 (작성자 본인만 가능)
  const editSaveFnc = async (item) => {
    if (!user || item.authorUid !== user.uid) {
      alert('본인이 작성한 글만 수정할 수 있습니다.')
      return
    }
    if (!editMessage.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    try {
      await updateDoc(doc(db, 'guestbook', item.id), {
        message: editMessage,
        updatedAt: serverTimestamp(),
      })
      setEditingId(null)
      setEditMessage('')
    } catch (error) {
      console.error('글 수정 에러 :', error)
      alert('수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // firestore Timestamp -> 화면에 보여줄 날짜 문자열로 변환
  // (작성 직후에는 서버에서 시간이 아직 안내려와서 createdAt이 잠깐 null일수 있음)
  const formatDate = (timestamp) => {
    if (!timestamp) return '방금 전'
    return timestamp.toDate().toLocaleDateString('ko-KR')
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
          <h1 className={styles.title}>방명록</h1>
          <p className={styles.subtitle}>선수에게 큰 힘이 됩니다</p>
          <p className={styles.subtitle}>당신의 응원메세지를 남겨주세요</p>
      </div>
      <div className={styles.content}>
        {
          user ? (
            // 회원 : 글 작성 폼 표시
            <GuestbookForm onAddPost={addPostFnc} defaultNickname={user.displayName || ''} />
          ) : (
            // 비회원 : 읽기만 가능, 작성 폼 대신 안내문구 표시
            <p className={styles.guestNotice}>
              방명록 작성은 로그인 후 이용할 수 있습니다.
            </p>
          )
        }

        {/* 방명록 목록 */}
        <div className={styles.listHeader}>
          <h2>여러분들의 응원기록</h2>
          <p className={styles.count}>{post.length}개의 응원</p>
        </div>
        {
          isLoading ? (
            <div className={styles.spinnerWrap}>
              <div className={styles.spinner}></div>
            </div>
          ) : post.length > 0 ? (
            <div className={styles.postList}>
              {
                post.map( (item) => {
                  // 현재 로그인한 유저 == 이 글의 작성자인지 확인
                  const isOwner = user && item.authorUid === user.uid
                  const isEditing = editingId === item.id

                  return (
                  <div key={item.id} className={styles.postCard}>
                      {
                        item.character && (
                          <div className={styles.postAvatar}>
                            <CharacterAvatar character={item.character} />
                          </div>
                        )
                      }
                      <div className={styles.postBody}>
                        <div className={styles.postHeader}>
                            <strong className={styles.postNickname}>{item.nickname}</strong>
                            <p className={styles.postDate}>
                              {formatDate(item.createdAt)}
                              {item.updatedAt && ' (수정됨)'}
                            </p>
                        </div>

                        {
                          isEditing ? (
                            // 수정 모드 : 텍스트 입력창 + 저장/취소 버튼
                            <div className={styles.editBox}>
                              <textarea
                                className={styles.editTextarea}
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                maxLength="500"
                              />
                              <div className={styles.postActions}>
                                <button className={styles.saveBtn} onClick={() => editSaveFnc(item)}>저장</button>
                                <button className={styles.cancelBtn} onClick={editCancelFnc}>취소</button>
                              </div>
                            </div>
                          ) : (
                            // 일반 모드 : 메세지 + (본인 글일때만) 수정/삭제 버튼
                            <>
                              <p className={styles.postMessage}>{item.message}</p>
                              {
                                isOwner && (
                                  <div className={styles.postActions}>
                                    <button className={styles.editBtn} onClick={() => editStartFnc(item)}>수정</button>
                                    <button className={styles.deleteBtn} onClick={ () => deleFun(item) }>삭제</button>
                                  </div>
                                )
                              }
                            </>
                          )
                        }
                      </div>
                  </div>
                  )
                })
              }
            </div>
          ) :(
            <p className={styles.empty}>기록이 없습니다</p>
          )
        }
      </div>
    </section>
  )
}

export default Guestbook