import React, { useRef, useState } from "react";
import {
  collection, doc, setDoc, Timestamp, getDoc, updateDoc
} from 'firebase/firestore' ;


const feedback = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "90%",
    width: "90%"
  }
  
  const options = [
    { value: 0, label: "Please choose an option"},
    { value: 1, label: "Movie scene matched to speech text" },
    { value: 2, label: "Speech text matched to movie scene" },
    { value: 3, label: "Object misrecognition" },
    { value: 4, label: "Typos recognized as actual words" },
    { value: 5, label: "None of the above"}
  ];
  

const Feedback = (props) => {
    // const [submitted, setSubmitted] = useState(false);
    const [wantinput, setWantinput] = useState(false);
    const otherreasons = useRef("");
    const [reason, setReason] = useState("");
    const hasReason = useRef(false);
    const [rating, setRating] = useState(-1);
    const hasRating = useRef(false);
    // const prevClient = useRef(null);
    // const prevRating = useRef(null);
    // const prevReason = useRef(null);
    const prevOtherReason = useRef(null);
    // const prevFeedbackTime = useRef(null);
    
    const db = props.db;
    const clientadd = props.clientadd;
    const clipInfo = props.clipInfo;
    const feedbackRef = collection(db, 'Feedback');
    const clipInfoRef = collection(db, 'Clip_info');
    // const tags = props.tags;
  
    const collectRate = (event) => {
      const selectedRating = parseInt(event.target.value);
      setRating(selectedRating);
      hasRating.current = true;
    }
  
    const collectOption = (event) => {
        const selectedValue = parseInt(event.target.value);
        var label;
        console.log(selectedValue)
        if (selectedValue !== 0) {
            label = options.find((option) => option.value === selectedValue).label;
        }
        setReason(label);
        if (selectedValue === 5) {
            setWantinput(true);
        } else {
            setWantinput(false);
        }
        hasReason.current = true;
    }
  
    const collectOtherReason = (event) => {
      const textareaData = document.getElementById('reason_input').value;
      otherreasons.current = textareaData;
    }
  
    
    // useEffect (() => {
    //     console.log("fetching")
    //     const q = query(colRef, where("client", "==", clientadd), 
    //                             orderBy("feedback_time"),
    //                             limit(1));

    //     getDocs(q).then((querySnapshot) => {
    //         if (!querySnapshot.empty) {
    //             console.log("size of querySnapshot", querySnapshot.size);
    //             const currdocdata = querySnapshot.docs[0].data(); // This is the document
    //             prevRating.current = currdocdata.rating;
    //             prevReason.current = currdocdata.reason;
    //             prevOtherReason.current = currdocdata.other_reasons;
    //             console.log("asdfasdf", currdocdata.reason);
    //             setRating(prevRating.current);
    //             setReason(prevReason.current);
    //         }
    //     })
    // }, []);


    const submit = async () => {
      //storing the feedback
      const warningElement = document.getElementById("warning");
      const submissionElement = document.getElementById("submissiontxt");
      if (!(hasRating.current || hasReason.current)) {
        warningElement.style.display = "flex";
      } else {
        warningElement.remove();
        const now = Timestamp.now().toDate().toString();
        // TODO delete all the "async"
        const docRef = doc(feedbackRef, clientadd + "_" + now.replace(/\([^()]*\)/g, ''));
        const clipStart = clipInfo.start;
        const clipEnd = clipInfo.end;
        const contentHash = clipInfo.hash;
        const clipRef = doc(clipInfoRef, contentHash + "_" + clipStart + "-" + clipEnd);
        const clip = await getDoc(clipRef);
        const clipRank = clipInfo.rank;
        setDoc(docRef, {
            client: clientadd, 
            feedback_time: new Date(now),
            rating: rating,
            clipHash: contentHash + "_" + clipStart + "-" + clipEnd,
            // searchID: props.searchID
            reason: reason, 
            other_reasons: otherreasons.current
            // viewTime: props.viewTime
        }).then(() => {
            console.log("Feedback collected successfully!");
        })

        if (!clip.exists()) {
            setDoc(clipRef, {
                contentHash: contentHash,
                start_time: clipStart,
                end_time: clipEnd,
                rank: [{saerchID: props.searchID, rank: clipRank}],
                tags: props.tags
            }).then(() => {
                console.log("corresponding clip stored successfully!");
            })
        } else {
            const tempRank = clip.data().rank;
            if (!(tempRank[tempRank.length - 1].rank === clipRank && 
                  tempRank[tempRank.length - 1].saerchID === props.searchID)) {
              tempRank.push({saerchID: props.searchID, rank: clipRank});
              updateDoc(clipRef, {
                  rank: tempRank
              })
            }
        }
        
        const textElement = document.getElementById('reason_input');
        if (textElement !== null) {
            textElement.remove();
        }

        submissionElement.style.display = "flex";
      }
    }
  
    return (
      <div style={feedback}>
        {/* <div>rate me</div> */}
        
        {/* rating system */}
        <div className="rating" style={{ display: "flex", flexDirection: "row"}}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div className={`star${num}`} style={{ display: "flex", flexDirection: "column" }} key={`star${num}`}>
              <input type="checkbox" id={`star${6 - num}`} name="rating" checked={num <= rating} value={num} onChange={collectRate}></input>
              <label htmlFor={`star${num}`}>{num}</label>
            </div>
          ))}
        </div>
  
        <div style={{display: "flex", width: "100%", flexDirection: "column"}}>
          <div style = {{display: "flex", width: "100%", flexDirection: "column"}}>
            <select id="choices" onChange={collectOption}>
              {options.map((option) => (
                <option key={option.label} value={option.value} style={{width: "100%"}}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        
          {wantinput ? (
                <textarea 
              id="reason_input" 
              name="freeform"
              rows="4" cols="30" 
              placeholder="Tell us your experience..."
              value={prevOtherReason.current}
              onChange={(event) => collectOtherReason(event.target.value)}
              style = {{width: "100%"}}></textarea>
          ): null}
        </div>

        <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "3%", marginBottom: "1%"}}>
            <button onClick={submit}>Submit</button>
          </div>
        
        <div id="warning" style={{display: "none", alignItems: "center", justifyContent: "center", marginTop: "3%", marginBottom: "1%"}}>
          Please give us your feedback
        </div>
        <div id='submissiontxt' style={{display: 'none', alignItems: "center", justifyContent: "center"}}>
          Thanks for your feedback!
        </div>

      </div>
    )
  }

  export default Feedback;