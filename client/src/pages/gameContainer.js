import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import ScoreContext from '../context/scoreContext';
import SpecialContext from '../context/specialContext';
import useEventListener from '../hooks/useEventListener';
import useIntersection from '../hooks/useIntersection';
import Plane from '../components/plane/index';
import Missle from '../components/missle/index';
import { Enemy, Enemy2, Enemy3, Enemy4 } from '../components/enemies';
import Stats from '../components/stats';
import EarthShield from '../components/earthShield/EarthShield';
import SpecialMissle from '../components/specialMissle';
import Lightning from '../components/lightning';

const GameContainer = () => {

    // refs
    const planeRef = useRef();
    const missleRef = useRef();
    const specialMissleRef = useRef();
    const lightningRef = useRef();
    const enemyRef = useRef();
    const enemy2Ref = useRef();
    const enemy3Ref = useRef();
    const enemy4Ref = useRef();

    // audio
    const laser = new Audio('laser.mp3');
    const splode = new Audio("splode.mp3");
    const specialSound = new Audio("special.mp3");

    // context
    const { setScore } = useContext(ScoreContext);
    const { special, clearSpecial } = useContext(SpecialContext);

    // state
    const [gameOver, setGameOver] = useState(false);
    const [lives, setLives] = useState(3);
    const [isFlying, setIsFlying] = useState(false);
    const [charge, setCharge] = useState(3);
    const [specialReset, setSpecialReset] = useState(false);

    // handle wheel events
    const wheelHandler = useCallback(
        ({ deltaY }) => {
            if (deltaY < 0 ) {
                planeRef.current.style.top = parseInt(planeRef.current.style.top) - 7 + "px";
            }
            if (deltaY > 0) {
                planeRef.current.style.top = parseInt(planeRef.current.style.top) + 7 + "px";
            }
        }, []);

    // useEventListener for wheel
    useEventListener("wheel", wheelHandler, window);

    // handle mouse down event
    const mouseDownHandler = useCallback(() => {
        if (!gameOver && !isFlying && charge === 3 && special < 5) {
            setIsFlying(true);
            setCharge(0);
            laser.volume = .25;
            laser.play();
            missleRef.current.style.visibility = "visible";
        }
        if (!gameOver && !isFlying && charge === 3 && special === 5) {
            specialSound.volume = 1;
            specialSound.play();
            setSpecialReset(true);
            missleRef.current.style.visibility = "hidden";
            missleRef.current.style.top = 0 + "px";
            specialMissleRef.current.style.visibility = "visible";
        }
    }, [laser, isFlying, charge, gameOver, special, specialSound]);

    // useEventListener for mouse down
    useEventListener("mousedown", mouseDownHandler, window);

    // handle key down events
    const keyHandler = useCallback(({ key }) => {
        if (!gameOver && key === "ArrowUp") {
            planeRef.current.style.top = parseInt(planeRef.current.style.top) - 30 + "px";
        }
        if (!gameOver && key === "ArrowDown") {
            planeRef.current.style.top = parseInt(planeRef.current.style.top) + 30 + "px";
        }
        if (!gameOver && key === " " && !isFlying && charge === 3 && special < 5) {
            setIsFlying(true);
            setCharge(0);
            laser.volume = .25;
            laser.play();
            missleRef.current.style.visibility = "visible";
        }
        if (key === " " && !gameOver && charge === 3 && !isFlying && special === 5) {
            specialSound.volume = 1;
            specialSound.play();
            setSpecialReset(true);
            missleRef.current.style.visibility = "hidden";
            missleRef.current.style.top = 0 + "px";
            specialMissleRef.current.style.visibility = "visible";
        }
    }, [laser, isFlying, charge, gameOver, special, specialSound]);

    // useEventListener for key down events
    useEventListener("keydown", keyHandler, document);

    // useIntersection for detecting collision and screen width
    useIntersection(missleRef, enemyRef, isFlying, setIsFlying, setLives, gameOver);
    useIntersection(missleRef, enemy2Ref, isFlying, setIsFlying, setLives, gameOver);
    useIntersection(missleRef, enemy3Ref, isFlying, setIsFlying, setLives, gameOver);
    useIntersection(missleRef, enemy4Ref, isFlying, setIsFlying, setLives, gameOver);

    useEffect(() => {
        if (lives === 0) {
            const gameOverTimer = setTimeout(setGameOver(true), 3000);
            return () => {
                clearTimeout(gameOverTimer);
            };
        }
    }, [lives]);

    useEffect(() => {
        if (!gameOver && charge < 3) {
            const chargeTimer = setInterval(() => setCharge(charge => charge + 1), 500);
            return () => {
                clearInterval(chargeTimer);
            };
        }
    }, [charge, gameOver]);

    useEffect(() => {
        if (!gameOver) {
            document.getElementById("bgMusic").volume = .50;
            document.getElementById("bgMusic").play();
        }
    }, [gameOver]);

    useEffect(() => {
        const enemyReset = () => {
            enemyRef.current.className = "target";
            enemyRef.current.style.right = -300 + "px";
            enemy2Ref.current.className = "target2";
            enemy2Ref.current.style.right = -200 + "px";
            enemy3Ref.current.className = "target3";
            enemy3Ref.current.style.right = -100 + "px";
            enemy4Ref.current.className = "target4";
            enemy4Ref.current.style.right = 0 + "%";
            specialMissleRef.current.style.visibility = "hidden";
            lightningRef.current.style.visibility = "hidden";
            setScore(score => score + 400);
            setSpecialReset(false);
            clearSpecial();
        };
        const destroyAllEnemies = () => {
            splode.volume = .75;
            splode.play();
            enemyRef.current.className = "destroyed";
            enemy2Ref.current.className = "destroyed";
            enemy3Ref.current.className = "destroyed";
            enemy4Ref.current.className = "destroyed";
            lightningRef.current.style.visibility = "visible";
            specialMissleRef.current.style.visibility = "hidden";
        };
        if (!gameOver && specialReset) {
            const specialResetTimer = setTimeout(enemyReset, 1200);
            const destroyAllTimer = setTimeout(destroyAllEnemies, 800);
            return () => {
                clearTimeout(specialResetTimer);
                clearTimeout(destroyAllTimer);
            }
        }
    }, [gameOver, specialReset, clearSpecial, setScore, splode]);


    if (gameOver) {
        return <Redirect to="/initials" />;
    }

    return (
        <div id="game-container">
            <audio id="bgMusic" src="bg.mp3" loop />
            <Lightning ref={lightningRef}>
                <SpecialMissle ref={specialMissleRef} />
            </Lightning>
            <EarthShield className={
                lives === 3 ? 
                "earth border-success" : 
                lives === 2 ? "earth border-warning" : 
                "earth border-danger"
                } 
            />
            <Stats 
                charge={charge} 
                lives={lives} 
                gameOver={gameOver} 
            />
            <Enemy ref={enemyRef} />
            <Enemy2 ref={enemy2Ref} />
            <Enemy3 ref={enemy3Ref} />
            <Enemy4 ref={enemy4Ref} />
            <Plane ref={planeRef}>
                <Missle ref={missleRef} />
            </Plane>
        </div>
    );
};

export default GameContainer;