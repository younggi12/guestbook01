import React, {useEffect, useState} from 'react'
import styles from "./Home.module.scss";

const videos = [
  { eyebrow : "SPEED . POWER . GLORY", title : "BORN TO RACE", label : "달리기 위해 태어난 순간", src : '/mp4/F8.mp4'},
  { eyebrow : "NO LIMITS", title : "PUSH THE LIMITS", label : "한계를 넘어서는 순간", src : '/mp4/F6.mp4'},
  { eyebrow : "FEEL IT", title : "FEEL THE SPEED", label : "느껴보세요, 진짜 레이스의 전율", src : '/mp4/F10.mp4'},
]

const Home = () => {
    // 현재 보여줄 영상 번호
    const [activeIndex, setActiveIndex] = useState(0)

    // 현재 보여줄 영상 객체
    // 만약 사용하지 않는다면 src={activeVideo.src} 대신 videos[setActiveIndex].src
    const activeVideo = videos[activeIndex]

    // 4초마다 다음 영상으로 전환 
    useEffect( () => {
        const timer = setInterval( () => {
          setActiveIndex( (idx) => {
            // 마지막 영상이면 첫번째 영상으로  
              if( idx === videos.length-1 ){
                return 0
              }
              // 마지막 영상이 아니면 다음 영상으로 이동 
              return idx + 1
          })
        }, 6000);

        return () => {
            clearInterval(timer)
        }
    }, [])

  return (
    <section className={styles.home}>
      <div className={styles.slide}>
          <video key={activeVideo.src} autoPlay muted loop playsInline>
              <source src={activeVideo.src} type='video/mp4' />
          </video>
      </div>

      {/* 텍스트 영역 - 영상이 바뀔때마다 key를 바꿔서 페이드인 애니메이션이 다시 실행되게 함 */}
      <div className={styles.copy} key={activeVideo.src}>
            <div className={styles.accentBar}></div>
            <div className={styles.copyText}>
                { activeVideo.eyebrow && <p className={styles.eyebrow}>{activeVideo.eyebrow}</p> }
                { activeVideo.title && <h1>{activeVideo.title}</h1> }
                { activeVideo.label && <h2>{activeVideo.label}</h2> }
            </div>
      </div>

      {/* 스크롤 유도 문구 */}
      <div className={styles.scrollHint}>
        <span>SCROLL</span>
        <div className={styles.scrollLine}></div>
      </div>

      {/* 동영상을 알려주는 점(도트) */}
      <div className={styles.dots}>
            { videos.map( (item, index) => {
                return(
                  <button key={item.src} 
                  className={index === activeIndex ? styles.activeDot : ""} 
                  onClick={() => {
                    setActiveIndex(index)
                  }}/>
                )
            }) }
      </div>
    </section>
  )
}

export default Home