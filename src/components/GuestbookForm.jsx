import React, { useState } from 'react'
import CharacterAvatar from './CharacterAvatar'
import CHARACTERS from './characterData'
import styles from './GuestbookForm.module.scss'

const EMOJIS = ['😀', '😊', '🥰', '😂', '😮', '😢', '😭', '😴', '🤔', '😎', '🥳',]

// 처음 진입시 기본으로 선택되어있을 선수 (배열의 첫번째 선수)
const DEFAULT_CHARACTER = CHARACTERS[0]?.id || ''

const GuestbookForm = ( {onAddPost, defaultNickname = ''} ) => {
    // 로그인한 유저의 닉네임(displayName)이 있으면 기본값으로 채워줌
    const [nickname, setNickname] = useState(defaultNickname)
    const [message, setMessage] = useState('')
    // 처음 화면을 봤을때 "뭘 고르는건지" 헷갈리지 않도록 기본 선수를 미리 선택해둠
    const [character, setCharacter] = useState(DEFAULT_CHARACTER)

    // 선택된 character id에 해당하는 선수의 전체 정보(이름, 나이, 경력, 팀)를 찾음
    const selectedCharacter = CHARACTERS.find( (item) => item.id === character )

    const addE = (emoji) => {
        setMessage( (msg) => msg + emoji )
    }
    const submitFnc = (e) => {
      e.preventDefault()
      const newPost = {
        nickname : nickname,
        message : message,
        character : character,
      }
      onAddPost(newPost)

      // 닉네임은 로그인 정보로 유지, 메세지만 초기화, 선수는 기본값으로 되돌림
      setNickname(defaultNickname)
      setMessage("")
      setCharacter(DEFAULT_CHARACTER)
    }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={submitFnc}>
        <h2 className={styles.heading}>응원하는 선수를 선택하세요!</h2>
        <div>
            <p className={styles.emojiLabel}>당신의 표정</p>

            <div className={styles.emojiRow}>
              {
                EMOJIS.map( (item) => (
                      <button key={item} type='button' className={styles.emojiBtn} onClick={() => addE(item) }>
                          {item}
                      </button>
                ))
              }
            </div>

            <label className={styles.field}>
                닉네임
                <input type="text" value={nickname} onChange={ (e) => {
                setNickname(e.target.value)
                }} placeholder='사용할 이름' maxLength="20" required />
            </label>

            <label className={styles.field}>
                메세지
                <textarea type="text" value={message} onChange={ (e) => {
                setMessage(e.target.value)
                }} placeholder='아무거나' maxLength="500" required />
                <span className={styles.charCount}>{message.length}/500</span>
            </label>

            {/* 체커 플래그 구분선 - 폼 상단과 미리보기 사이 포인트 */}
            <div className={styles.checkerDivider}></div>

            {/* 캐릭터 미리보기 + 선수 프로필(이름/나이/경력/팀) */}
            {
              selectedCharacter && (
                <div className={styles.preview}>
                  <p className={styles.previewLabel}>선택한 선수 :</p>
                  <div className={styles.previewContent}>
                    <div className={styles.previewAvatar}>
                      <CharacterAvatar  character={character}/>
                    </div>
                    <div
                      className={styles.profileCard}
                      style={{ '--team-color': selectedCharacter.teamColor }}
                    >
                      <div className={styles.profileTop}>
                        <p className={styles.profileName}>{selectedCharacter.name}</p>
                        <span className={styles.teamBadge}>
                          {selectedCharacter.team}
                        </span>
                      </div>
                      <ul className={styles.profileList}>
                        <li>
                          <span>나이</span>
                          <strong>{selectedCharacter.age}</strong>
                        </li>
                        <li className={styles.careerItem}>
                          <span>수상 경력</span>
                          <strong>{selectedCharacter.career}</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )
            }

            {/* 선수 선택상자 */}
            <div className={styles.characterBox}>
                <div className={styles.characterBoxHeader}>
                  <strong>선수 선택</strong>
                  <span className={styles.characterHint}>사진을 눌러서 응원할 선수를 바꿔보세요</span>
                </div>
                <div className={styles.characterGrid}>
                {
                  CHARACTERS.map( (item) => {
                    return (
                      <button key={item.id} type='button'
                      className={ character === item.id ? `${styles.characterBtn} ${styles.selected}` : styles.characterBtn}
                      style={{ '--team-color': item.teamColor }}
                      onClick={ () => setCharacter(item.id) }>

                          <div className={styles.characterPhoto}>
                            <CharacterAvatar  character={item.id} />
                          </div>

                          {/* 등번호만 표시 */}
                          <div className={styles.characterInfo}>
                            <span className={styles.characterNumber}>{item.number}</span>
                          </div>

                          {
                            character === item.id && (
                              <span className={styles.checkMark}>✓</span>
                            )
                          }
                      </button>
                    )
                  })
                }
                </div>
            </div>

        </div>

        <div>
            <button type='submit' className={styles.submitBtn}>
              <span className={styles.submitBtnText}>응원 남기기</span>
            </button>
        </div>
      </form>
    </div>
  )
}

export default GuestbookForm
