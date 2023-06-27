import React, { useRef, useState, useEffect } from "react";
import {
  getFirestore, collection, getDocs, orderBy, doc, query, where, limit, get, setDoc, Timestamp, getDoc
} from 'firebase/firestore' ;


const feedback = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
  
  const options = [
    { value: 1, label: "Movie scene matched to speech text" },
    { value: 2, label: "Speech text matched to movie scene" },
    { value: 3, label: "Object misrecognition" },
    { value: 4, label: "Typos recognized as actual words" },
    { value: 5, label: "None of the above"}
  ];
  

const Feedback = (props) => {
    const [submitted, setSubmitted] = useState(false);
    const [wantinput, setWantinput] = useState(false);
    const otherreasons = useRef(null);
    const [reason, setReason] = useState(null);
    const [rating, setRating] = useState(0);
    const prevClient = useRef(null);
    const prevRating = useRef(null);
    const prevReason = useRef(null);
    const prevOtherReason = useRef(null);
    const prevFeedbackTime = useRef(null);
    
    const db = props.db;
    const clientadd = props.clientadd;
    const colRef = collection(db, 'Books'); //TODO change it to Feedback
  
    const collectRate = (event) => {
      const selectedRating = parseInt(event.target.value);
      setRating(selectedRating);
    }
  
    const collectOption = (event) => {
        const selectedValue = parseInt(event.target.value);
        console.log(selectedValue)
        const label = options.find((option) => option.value === selectedValue).label;
        setReason(label);
        if (selectedValue === 5) {
            setWantinput(true);
        } else {
            setWantinput(false);
        }
    }
  
    const collectOtherReason = (event) => {
      const textareaData = document.getElementById('reason_input').value;
      otherreasons.current = textareaData;
    }
  
    
    useEffect (() => {
        console.log("fetching")
        const q = query(colRef, where("client", "==", clientadd), 
                                orderBy("feedback_time"),
                                limit(1));

        getDocs(q).then((querySnapshot) => {
            if (!querySnapshot.empty) {
                console.log("size of querySnapshot", querySnapshot.size);
                const currdocdata = querySnapshot.docs[0].data(); // This is the document
                // prevClient.current = currdocdata.client;
                prevRating.current = currdocdata.rating;
                prevReason.current = currdocdata.reason;
                prevOtherReason.current = currdocdata.other_reasons;
                console.log("asdfasdf", currdocdata.reason);
                // prevFeedbackTime.current = currdocdata.feedback_time;
                setRating(prevRating.current);
                setReason(prevReason.current);
            }
        })
    }, []);


    const submit = async () => {
      const now = Timestamp.now().toDate().toString();
      const docRef = await doc(colRef, clientadd + "_" + now);
      setDoc(docRef, {client: clientadd, 
                      feedback_time: new Date(now),
                      rating: rating,
                      reason: reason, 
                      other_reasons: otherreasons.current}).then(() => {
                        console.log("Feedback collected successfully!");
                    })

      const textElement = document.getElementById('reason_input');
      if (textElement !== null) {
        textElement.remove();
      }

      setSubmitted(true);
    }
  
    return (
      <div style={feedback}>
        {/* <div>rate me</div> */}
        <br></br>
  
        <p></p>
        {/* rating system */}
        <div className="rating" style={{ display: "flex", flexDirection: "row" }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <div className={`star${num}`} style={{ display: "flex", flexDirection: "column" }} key={`star${num}`}>
              <input type="radio" id={`star${6 - num}`} name="rating" checked={num === rating} value={num} onChange={collectRate}></input>
              <label htmlFor={`star${num}`}>{num}</label>
            </div>
          ))}
        </div>
  
        <div>
          <div style = {{flexDirection: "column"}}>
            <select id="choices" onChange={collectOption}>
              {options.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
  
          {wantinput ? (
            <div style = {{flexDirection: "column"}}>
              <textarea 
              id="reason_input"
              name="freeform"
              rows="4" cols="30" 
              placeholder="Tell us your experience..."
              value={prevOtherReason.current}
              onChange={(event) => collectOtherReason(event.target.value)}></textarea>
            </div>
          ): null}
  
          <button onClick={submit} style={{alignItems: "center"}}>Submit</button>
          {submitted ? (
            <div id='submissiontxt' style={{display: 'flex'}}>Thanks for your feedback</div>
          ): null}
          
        </div>
      </div>
    )
  
  }

  export default Feedback;