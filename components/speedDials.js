import styles from "./speedDials.module.css"
export default function SpeedDials({speed}){
    console.log(speed);
    return(
        <div className={styles.container}>
            <h1 className={styles.speed}>{speed}</h1>
            <h3>Kmph</h3>
        </div>
    )
}