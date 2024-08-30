'use client'
import { useEffect, useState } from "react"
import styles from "./speedDials.module.css"
export default function SpeedDials({speed, predictedSpeed, trafficSignalSaturation, reachingProbability}){
    // const [prevSpeed,setPrevSpeed]=useState(null);
    // useEffect(()=>{
    //     console.log(prevSpeed-predictedSpeed);
    //     setPrevSpeed(predictedSpeed);
    // },[predictedSpeed])
    const [predictedSpeedNext,setPredictedSpeedNext]=useState(0);
    setInterval(() => {
        setPredictedSpeedNext(predictedSpeed);
    }, 2000);
    console.log(reachingProbability);
    return(
        <div className={styles.container}>
            <div className={styles.probCurve} style={reachingProbability===25?{transform:"rotate(-180deg)"}:null}></div>
            <h1 className={styles.speed}>{trafficSignalSaturation?"Max":Math.floor(predictedSpeedNext*3.6)}</h1>
            <h3>Kmph</h3>
        </div>
    )
}