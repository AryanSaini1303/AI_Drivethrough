import styles from "./speedDials.module.css"
export default function SpeedDials(){
    return(
        <div className={styles.container}>
            <h1 className={styles.speed}>20</h1>
            <h3>Kmph</h3>
        </div>
    )
}