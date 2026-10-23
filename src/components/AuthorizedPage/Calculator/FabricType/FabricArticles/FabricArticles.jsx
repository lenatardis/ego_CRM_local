import React from "react";
import styles from './FabricArticles.module.scss';


const FabricArticles = ({fabric}) => {
    let types = fabric?.mono_fabric_type || [];
    return (
        <>
            <div className={styles.articles}>
                <button className={types.length > 0 && types.includes('A') ? styles.articleActive : styles.article}>
                    <span>A: {!fabric?.code ? fabric?.fabric_a?.name : (types.length > 0 && types.includes('A') ? fabric?.code : '')}</span>
                </button>
                <button className={types.length > 0 && types.includes('B') ? styles.articleActive : styles.article}>
                    <span>B: {!fabric?.code ? fabric?.fabric_b?.name : (types.length > 0 && types.includes('B') ? fabric?.code : '')}</span>
                </button>
            </div>
        </>
    )
}

export default FabricArticles;