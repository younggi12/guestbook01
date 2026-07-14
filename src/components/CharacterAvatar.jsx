import React from 'react'
import CHARACTERS from './characterData'
import styles from './CharacterAvatar.module.scss'

const CharacterAvatar = ({ character }) => {
  const characterData = CHARACTERS.find( (item) => item.id === character )
  if(!characterData) return null
  return (
    <img className={styles.avatar} src={characterData.src} alt={characterData.label} />
  )
}

export default CharacterAvatar