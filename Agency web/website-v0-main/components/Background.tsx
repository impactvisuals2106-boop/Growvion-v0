'use client'

export default function Background() {
  return (
    <div className="fixed-bg">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <video autoPlay muted loop playsInline className="video-bg">
        <source src="/assets/animation video.mp4" type="video/mp4" />
      </video>
    </div>
  )
}




