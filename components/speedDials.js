import styles from "./speedDials.module.css"
export default function SpeedDials({speed, predictedSpeed}){
    console.log(predictedSpeed);
    return(
        <div className={styles.container}>
            <h1 className={styles.speed}>{Math.floor(predictedSpeed*3.6)}</h1>
            <h3>Kmph</h3>
        </div>
    )
}