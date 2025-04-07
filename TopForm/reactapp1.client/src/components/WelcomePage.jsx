import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Design/Welcome.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="welcome-page">
            <div className="overlay">
                <div className="content">
                    <h1>Üdvözöllek a <span>TopForm</span>-ban!</h1>
                    <p className="intro-text">
                        A legjobb hely, ahol elérheted a csúcsformád! Kövesd a fejlődésed, kapj személyre szabott edzésterveket, és légy része egy támogató közösségnek.
                    </p>
                    <div className="features">
                        <div className="feature">
                            <h2>📊 Teljesítménykövetés</h2>
                            <p>Naplózd az edzéseid és nézd meg, hogyan fejlődsz.</p>
                        </div>
                        <div className="feature">
                            <h2>💪 Személyre szabott tervek</h2>
                            <p>Kapj egyéni edzéstervet és étrendet a céljaidnak megfelelően.</p>
                        </div>
                        <div className="feature">
                            <h2>🤝 Közösségi támogatás!</h2>
                            <p>Csatlakozz egy inspiráló közösséghez és motiváljátok egymást.</p>
                        </div>
                    </div>
                    <button className="login-button" onClick={handleLoginClick}>Lépj be most</button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
