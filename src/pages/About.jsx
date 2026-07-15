import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./About.module.scss";


const TEAMS = [
  {
    name:"Ferrari",
    logo:"/img/team-ferrari1.png"
  },
  {
    name:"Mercedes",
    logo:"/img/team-mercedes1.png"
  },
  {
    name:"Red Bull",
    logo:"/img/team-redbull1.jpg"
  },
  {
    name:"McLaren",
    logo:"/img/team-mclaren2.webp"
  },
  {
    name:"Porsche",
    logo:"/img/team-porsche1.jpg"
  },
  {
    name:"Aston Martin",
    logo:"/img/team-astonmartin4.png"
  },
  {
    name:"Monster",
    logo:"/img/team-monster.jpg"
  }
];



const HISTORY = [
  {
    year:"1950",
    text:"FIA Formula One World Championship 시작"
  },
  {
    year:"1960",
    text:"레이싱 기술과 팀 경쟁 발전"
  },
  {
    year:"2000",
    text:"Ferrari와 Michael Schumacher 전성기"
  },
  {
    year:"2020",
    text:"하이브리드 엔진 시대와 새로운 규정"
  },
  {
    year:"2026",
    text:"새로운 기술 규정과 Formula 1의 미래"
  }
];



const DRIVERS = [
  {
    name:"Lewis Hamilton",
    image:"/img/driver-hamilton.jpg",
    record:"7 World Championships"
  },
  {
    name:"Michael Schumacher",
    image:"/img/driver-schumacher.jpg",
    record:"7 World Championships"
  },
  {
    name:"Max Verstappen",
    image:"/img/driver-verstappen1.jpg",
    record:"Multiple World Champion"
  }
];


const CIRCUITS = [
  {
    name:"Monza",
    country:"Italy",
    tag:"Temple of Speed",
    image:"/img/circuit-monza.webp"
  },
  {
    name:"Spa-Francorchamps",
    country:"Belgium",
    tag:"Legendary Eau Rouge",
    image:"/img/circuit-spa.webp"
  },
  {
    name:"Suzuka",
    country:"Japan",
    tag:"Figure-8 Circuit",
    image:"/img/circuit-suzuka.webp"
  },
  {
    name:"Monaco",
    country:"Monaco",
    tag:"Streets of Monte Carlo",
    image:"/img/circuit-monaco.webp"
  }
];


/* =========================
   스크롤 등장 애니메이션 훅
   - 콜백 ref로 DOM에 실제로 마운트되는 시점을 감지
   - node가 준비된 후에 IntersectionObserver 연결
========================= */
const useReveal = () => {

  const [node,setNode] = useState(null);

  const [visible,setVisible] = useState(false);


  const ref = (el) => {

    setNode(el);

  };


  useEffect(()=>{

    if(!node) return;


    const observer = new IntersectionObserver(
      ([entry])=>{

        if(entry.isIntersecting){

          setVisible(true);

          observer.unobserve(entry.target);

        }

      },
      { threshold:0.2 }
    );


    observer.observe(node);


    return ()=> observer.disconnect();

  },[node]);


  return [ref,visible];

};



const About = () => {


  const [showContent,setShowContent] = useState(false);

  const [slideUp,setSlideUp] = useState(false);


  // 섹션별 reveal 훅
  const [infoRef,infoVisible] = useReveal();
  const [statsRef,statsVisible] = useReveal();
  const [historyRef,historyVisible] = useReveal();
  const [driverRef,driverVisible] = useReveal();
  const [circuitRef,circuitVisible] = useReveal();
  const [teamRef,teamVisible] = useReveal();


  /* =========================
     스크롤 진행률 (신규 추가)
     - topProgress : 페이지 전체 스크롤 비율 (상단 바용)
     - historyProgress : 히스토리 섹션이 뷰포트를 지나가는 비율 (타임라인 라인용)
  ========================= */
  const [topProgress,setTopProgress] = useState(0);

  const [historyProgress,setHistoryProgress] = useState(0);

  const historyElRef = useRef(null);


  // historyRef(리빌용 콜백)와 historyElRef(스크롤 계산용)를 한 요소에 같이 연결
  const combinedHistoryRef = (el) => {

    historyElRef.current = el;

    historyRef(el);

  };


  useEffect(()=>{

    const handleScroll = () => {

      // 전체 페이지 스크롤 진행률 (0~100)
      const scrollTop = window.scrollY;

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      setTopProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);


      // 히스토리 섹션이 화면을 지나가는 비율 (0~100)
      if(historyElRef.current){

        const rect = historyElRef.current.getBoundingClientRect();

        const winH = window.innerHeight;

        const total = rect.height + winH;

        const scrolled = winH - rect.top;

        const ratio = Math.min(Math.max(scrolled / total, 0), 1);

        setHistoryProgress(ratio * 100);

      }

    };


    window.addEventListener("scroll",handleScroll,{ passive:true });

    handleScroll();


    return () => window.removeEventListener("scroll",handleScroll);

  },[]);



  const videoEnd = () => {

    setSlideUp(true);

    setTimeout(()=>{

      setShowContent(true);

    },800);

  };



  const skipVideo = () => {

    setSlideUp(true);

    setTimeout(()=>{

      setShowContent(true);

    },800);

  };




return (

<div className={styles.aboutPage}>


{/* 상단 스크롤 진행률 바 (신규 추가) */}

<div
className={styles.scrollProgressBar}
style={{ width:`${topProgress}%` }}
/>



{/* INTRO VIDEO */}

{

!showContent &&


<div
className={`
${styles.introWrap}
${slideUp ? styles.slideUp : ""}
`}
>


<video
className={styles.introVideo}
autoPlay
muted
playsInline
onEnded={videoEnd}
>


<source
src="/mp4/F12.mp4"
type="video/mp4"
/>


</video>



<button
className={styles.skipBtn}
onClick={skipVideo}
>

Skip Intro →

</button>



</div>

}







{

showContent &&


<main className={styles.aboutContent}>


{/* HERO */}

<section className={styles.aboutHero}>


<h1>
ABOUT FORMULA 1
</h1>


<p>
Experience the speed, passion and innovation of Formula 1.
</p>


</section>








{/* FIA INTRO */}

<section
ref={infoRef}
className={`${styles.aboutInfo} ${styles.reveal} ${infoVisible ? styles.revealActive : ""}`}
>


<h2>
FIA Formula One World Championship™
</h2>



<p>

Formula One은 국제자동차연맹(FIA)이 주관하는
세계 최고 수준의 자동차 경주 대회입니다.

<br/>

1950년 시작된 이후 최고의 드라이버와 팀들이
월드 챔피언십을 위해 경쟁합니다.

</p>



</section>









{/* STATS */}

<section
ref={statsRef}
className={`${styles.aboutStats} ${styles.reveal} ${statsVisible ? styles.revealActive : ""}`}
>


<div className={styles.statCard}>

<h3>
1950
</h3>

<span>
Founded
</span>


</div>



<div className={styles.statCard}>

<h3>
76
</h3>

<span>
Years History
</span>


</div>




<div className={styles.statCard}>

<h3>
22
</h3>

<span>
Drivers
</span>


</div>




<div className={styles.statCard}>

<h3>
11
</h3>

<span>
Teams
</span>


</div>



</section>









{/* F1 HISTORY */}

<section
ref={combinedHistoryRef}
className={`${styles.historySection} ${styles.reveal} ${historyVisible ? styles.revealActive : ""}`}
>


<h2>
F1 HISTORY
</h2>



<div className={styles.historyList}>


{/* 스크롤에 맞춰 채워지는 진행 라인 (신규 추가) */}

<div
className={styles.historyProgressLine}
style={{ width:`${historyProgress}%` }}
/>



{

HISTORY.map((item,index)=>(


<div
className={styles.historyItem}
key={index}
>


<h3>
{item.year}
</h3>


<p>
{item.text}
</p>


</div>


))


}



</div>



</section>









{/* LEGENDARY DRIVERS */}

<section
ref={driverRef}
className={`${styles.driverSection} ${styles.reveal} ${driverVisible ? styles.revealActive : ""}`}
>


<h2>
LEGENDARY DRIVERS
</h2>



<div className={styles.driverList}>


{

DRIVERS.map((driver,index)=>(


<div
className={styles.driverCard}
key={index}
>


<img
src={driver.image}
alt={driver.name}
/>



<h3>
{driver.name}
</h3>



<p>
{driver.record}
</p>



</div>


))


}



</div>


</section>









{/* FAMOUS CIRCUITS */}

<section
ref={circuitRef}
className={`${styles.circuitSection} ${styles.reveal} ${circuitVisible ? styles.revealActive : ""}`}
>


<h2>
FAMOUS CIRCUITS
</h2>



<div className={styles.circuitList}>


{

CIRCUITS.map((circuit,index)=>(


<div
className={styles.circuitCard}
key={index}
>


<img
src={circuit.image}
alt={circuit.name}
/>



<div className={styles.circuitInfo}>


<span>
{circuit.country}
</span>


<h3>
{circuit.name}
</h3>


<p>
{circuit.tag}
</p>


</div>



</div>


))


}



</div>


</section>









{/* TEAM LOGO SLIDER */}

<section
ref={teamRef}
className={`${styles.teamSection} ${styles.reveal} ${teamVisible ? styles.revealActive : ""}`}
>


<h2>
FORMULA 1 TEAMS
</h2>



<div className={styles.teamSlider}>


<div className={styles.teamTrack}>


{

[...TEAMS,...TEAMS].map((team,index)=>(


<div
className={styles.teamLogo}
key={index}
>


<img
src={team.logo}
alt={team.name}
/>



</div>


))


}



</div>


</div>







<Link to="/guest">


<button
className={styles.goGuestbookBtn}
>

Go Guestbook →

</button>


</Link>




</section>





</main>


}



</div>


)

}



export default About;