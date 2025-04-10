import React from 'react'
import '../Design/Welcome.css'
import { useNavigate } from 'react-router-dom'
const TopformIntro = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/login');
    } 
  return (
    <div className="topform-container">
      <div className="topform-logo-container">
        <img src="/topformlogo.png" alt="TopForm logó" className="topform-logo topform-logo-big" />
        <img src="/topformlogo2.png" alt="TopForm ikon" className="topform-logo2" />
      </div>

      <div className="topform-content">
        <div className="topform-image">
          <img src="/edzesnagykep.png" alt="Edzőtermi kép" />
        </div>

        <div className="topform-info">
          <div className="topform-feature">
            <img src="/edzesterv.jpg" alt="Edzésterv ikon" />
            <div>
              <h3>Edzéstervek</h3>
              <p>Kapd meg saját edzésterved személyre szabva, vagy építsd fel magadnak pár kattintással!</p>
            </div>
          </div>

          <div className="topform-feature">
            <img src="/dieta2.jpg" alt="Étrend ikon" />
            <div>
              <h3>Étrendek</h3>
              <p>Rakd össze a saját étrendedet pár kattintással, és legyél sokkal egészségesebb!</p>
            </div>
          </div>

          <div className="topform-feature">
            <img src="/trophy.jpg" alt="Verseny ikon" />
            <div>
              <h3>Versenyezz</h3>
              <p>Küzdj az első helyért a többi felhasználóval és nézd meg hogy hol állsz a ranglistán!</p>
            </div>
          </div>

          <div className="topform-buttons">
            <button className="login" onClick={handleClick}>Belépés</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopformIntro