import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Packages from '@/components/Packages'
import Team from '@/components/Team'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import Background from '@/components/Background'

export default function Home() {
  return (
    <>
      <Background />
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Packages />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  )
}




