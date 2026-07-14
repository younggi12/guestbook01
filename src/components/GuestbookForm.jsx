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
        <h2 className={styles.heading}>응원하는 선수를 골라보세요!</h2>
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
            </label>
            {/* 캐릭터 미리보기 */}
            {
              character && (
                <div className={styles.preview}>
                  <p className={styles.previewLabel}>선택한 선수 :</p>
                  <div className={styles.previewAvatar}>
                    <CharacterAvatar  character={character}/>
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
                  CHARACTERS.map( (item) => (
                    <button key={item.id} type='button'
                    className={ character === item.id ? `${styles.characterBtn} ${styles.selected}` : styles.characterBtn}
                    onClick={ () => setCharacter(item.id) }>
                        <CharacterAvatar  character={item.id} />
                        {
                          character === item.id && (
                            <span className={styles.checkMark}>✓</span>
                          )
                        }
                    </button>
                  ))
                }
                </div>
            </div>

        </div>

        <div>
            <button type='submit' className={styles.submitBtn}>응원 남기기</button>
        </div>
      </form>
    </div>
  )
}

export default GuestbookForm