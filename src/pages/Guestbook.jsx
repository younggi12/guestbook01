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
import CHARACTERS from '../components/characterData'
import styles from './Guestbook.module.scss'

// 한 페이지에 보여줄 게시글 수
const POSTS_PER_PAGE = 4

// characterId로 팀 컬러 / 팀명을 찾는 헬퍼
const getTeamColor = (characterId) => {
  const found = CHARACTERS.find((item) => item.id === characterId)
  return found?.teamColor || '#e10600'
}

const getTeamName = (characterId) => {
  const found = CHARACTERS.find((item) => item.id === characterId)
  return found?.team || ''
}

// 필터 탭에 쓸 팀 목록 (중복 제거)
const TEAM_LIST = Array.from(new Set(CHARACTERS.map((item) => item.team)))

const Guestbook = () => {
  const [post, setPost] = useState([])
  // 최초 목록을 firestore에서 불러오는중인지 여부
  const [isLoading, setIsLoading] = useState(true)

  // 수정중인 게시글 id (수정중이 아니면 null)
  const [editingId, setEditingId] = useState(null)
  // 수정중인 내용(메세지)을 담는 임시 state
  const [editMessage, setEditMessage] = useState('')

  // 현재 페이지 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1)

  // 팀별 필터 ('all' = 전체보기)
  const [teamFilter, setTeamFilter] = useState('all')

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

  // 팀 필터가 적용된 목록
  const filteredPost =
    teamFilter === 'all'
      ? post
      : post.filter((item) => getTeamName(item.character) === teamFilter)

  // 전체 페이지 수 (필터된 목록 기준)
  const totalPages = Math.max(1, Math.ceil(filteredPost.length / POSTS_PER_PAGE))

  // 글이 삭제되는 등으로 전체 페이지 수가 줄어서
  // 현재 페이지가 마지막 페이지보다 커지면 마지막 페이지로 보정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // 필터를 바꾸면 항상 1페이지부터 다시 보여줌
  useEffect(() => {
    setCurrentPage(1)
  }, [teamFilter])

  // 현재 페이지에 해당하는 게시글만 잘라냄
  const pagedPosts = filteredPost.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  const goPrevPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  const goNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

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
        // 새 글은 항상 최신순 1페이지에 나오므로, 작성 직후엔 필터 해제하고 1페이지로 이동
        setTeamFilter('all')
        setCurrentPage(1)
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
          <h2>응원기록</h2>
          <p className={styles.count}>{filteredPost.length}개의 응원</p>
        </div>

        {/* 팀별 필터 탭 (게시글이 있을때만 표시) */}
        {
          post.length > 0 && (
            <div className={styles.filterTabs}>
              <button
                className={
                  teamFilter === 'all'
                    ? `${styles.filterTab} ${styles.filterTabActive}`
                    : styles.filterTab
                }
                onClick={() => setTeamFilter('all')}
              >
                전체
              </button>
              {
                TEAM_LIST.map((team) => (
                  <button
                    key={team}
                    className={
                      teamFilter === team
                        ? `${styles.filterTab} ${styles.filterTabActive}`
                        : styles.filterTab
                    }
                    onClick={() => setTeamFilter(team)}
                  >
                    {team}
                  </button>
                ))
              }
            </div>
          )
        }

        {
          isLoading ? (
            <div className={styles.spinnerWrap}>
              <div className={styles.spinner}></div>
            </div>
          ) : filteredPost.length > 0 ? (
            <>
              <div className={styles.postList}>
                {
                  pagedPosts.map( (item) => {
                    // 현재 로그인한 유저 == 이 글의 작성자인지 확인
                    const isOwner = user && item.authorUid === user.uid
                    const isEditing = editingId === item.id

                    return (
                    <div
                      key={item.id}
                      className={styles.postCard}
                      style={{ '--post-team-color': getTeamColor(item.character) }}
                    >
                        {
                          item.character && (
                            <div className={styles.postAvatar}>
                              <CharacterAvatar character={item.character} />
                            </div>
                          )
                        }
                        <div className={styles.postBody}>
                          <div className={styles.postHeader}>
                              <strong className={styles.postNickname}>{item.nickname}님</strong>
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

              {/* 페이지네이션 - 필터된 목록 기준 4개 초과일때만 표시 */}
              {
                totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageArrow}
                      onClick={goPrevPage}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>

                    {
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          className={
                            num === currentPage
                              ? `${styles.pageNum} ${styles.pageNumActive}`
                              : styles.pageNum
                          }
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      ))
                    }

                    <button
                      className={styles.pageArrow}
                      onClick={goNextPage}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </div>
                )
              }
            </>
          ) :(
            <p className={styles.empty}>
              {teamFilter === 'all' ? '기록이 없습니다' : '해당 팀 응원글이 없습니다'}
            </p>
          )
        }
      </div>
    </section>
  )
}

export default Guestbook