'use client'
import { useEffect, useState } from "react"
import styles from "./speedDials.module.css"
export default function SpeedDials({speed, predictedSpeed, trafficSignalSaturation, reachingProbability}){
    console.log(reachingProbability);
    return(
        <div className={styles.container}>
            {reachingProbability!==101&&<div className={styles.probCurve} style={reachingProbability===25?{transform:"rotate(-180deg)"}:null}></div>}
            <h1 className={styles.speed}>{trafficSignalSaturation?"Max":(predictedSpeed*3.6).toFixed(1)}</h1>
            <h3>Kmph</h3>
        </div>
    )
}