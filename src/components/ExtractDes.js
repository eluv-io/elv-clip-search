


const calculate_tf = (term, document) => {
    const words = document.split(" ");
    const mapping = new Map();
    for (const w of words) {
        mapping.set(w, (mapping.get(w) || 0) + 1);
    }
    const termCount = mapping.get(term);
    const totalTerms = words.length;
    return termCount / totalTerms
}

const calculate_idf = (term, documents) => {
    const document_count = documents.filter(doc => doc.includes(term)).length;
    const total_documents = documents.length;
    return Math.log(total_documents / (1 + document_count));
}

const calculate_tfidf = (term, document, documents) => {
    const tf = calculate_tf(term, document);
    const idf = calculate_idf(term, documents);
    return tf * idf
}

const preprosess = (lst) => {
    // const newDic = descriptions.filter((dic) => dic.shotID === shotID)
    const ret = []
    for (let dic of lst) {
        ret.push(dic.status)
    }
    return ret
}

export const select = (OD) => {
    // const residual = descriptions.filter((dic) => dic.shotID !== shotID)
    console.log(OD)
    const ret = {}
    for (let shotID in OD) {
        const descriptions = preprosess(OD[shotID]);
        // console.log(descriptions)
        // const newDes = preprosess(des);
        if (!descriptions.some(str => str.trim().split(/\s+/).length > 3)) {
            ret[shotID] = OD[shotID]
            continue
        }
        let most_informative_score = 0;
        let most_informative_idx = 0;
        let most_informative_des = "";
        let idx = 0
        for (let des of descriptions) {
            const terms = des.split(" ");
            if (terms.length <= 3) {
                continue
            }
            const tfidfScores = terms.map(term => calculate_tfidf(term, des, descriptions));
            const tfidfSum = tfidfScores.reduce((acc, score) => acc + score, 0);
            if (tfidfSum > most_informative_score) {
                most_informative_score = tfidfSum;
                most_informative_des = des
                most_informative_idx = idx
            }
            idx += 1
        }
        ret[shotID] = [OD[shotID][most_informative_idx]];
    }

    return ret
}