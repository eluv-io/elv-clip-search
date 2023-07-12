import React, { useRef, useState } from "react";
import {
  collection, doc, setDoc, Timestamp
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

  const starStyle = {
    body: {
      background: '#222225',
      color: 'white',
      margin: '20px auto',
    },
    rating: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    input: {
      display: 'none',
    },
    label: {
      position: 'relative',
      width: '1em',
      fontSize: '3vw',
      color: 'black',
      cursor: 'pointer',
      // font: bold;
      // background: red;
      // backgroundColor: "red"
      content: '☆'
    },
    labelBefore: {
      content: '\u2605',
      position: 'absolute',
      opacity: 0,
    },
    labelHoverBefore: {
      opacity: 1,
    },
    inputCheckedBefore: {
      opacity: 1,
    },
    ratingHoverInputCheckedBefore: {
      opacity: 0.4,
    },
  };

  

const Feedback = (props) => {
    // const [submitted, setSubmitted] = useState(false);
    const [wantinput, setWantinput] = useState(false);
    const otherreasons = useRef("");
    const [reason, setReason] = useState("");
    const hasReason = useRef(false);
    const [rating, setRating] = useState(-1);
    const hasRating = useRef(false);
    const prevOtherReason = useRef(null);
    
    const db = props.db;
    const clientadd = props.clientadd;
    const clipInfo = props.clipInfo;
    const feedbackRef = collection(db, 'Feedback');
    const clipInfoRef = collection(db, 'Clip_info');

    const [activeStar, setActiveStar] = useState([1]);
    const [fixedStar, setFixedStar] = useState([]);
  
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

    const getLabelStyle = (num) => {
      return {
        position: 'relative',
        width: '1em',
        fontSize: '3vw',
        color: 'black',
        cursor: 'pointer',
        color: num in activeStar ? "red" : "black"
      }
    }
    const handleHover = (num) => {
      console.log("Here I am");
      const active = []
      for (var i = 1; i <= num; i++) {
        active.push(i);
      }
      setActiveStar(active);
    }

    const handleMouseLeave = (num) => {
      console.log("Here I leave")
      
    }

    const submit = async () => {
      //storing the feedback
      const warningElement = document.getElementById("warning");
      const submissionElement = document.getElementById("submissiontxt");
      if (!(hasRating.current || hasReason.current)) {
        warningElement.style.display = "flex";
      } else {
        if (warningElement.style.display === "flex") {
          warningElement.style.display = "none";
        }
        const now = Timestamp.now().toDate().toString();
        // TODO delete all the "async"
        const docRef = doc(feedbackRef, clientadd + "_" + now.replace(/\([^()]*\)/g, ''));
        const clipStart = clipInfo.start;
        const clipEnd = clipInfo.end;
        const contentHash = clipInfo.hash;
        const clipRef = doc(clipInfoRef, contentHash + "_" + clipStart + "-" + clipEnd);
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
        {/* <div className="rating" style={{ display: "flex", flexDirection: "row"}}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div className={`star${num}`} style={{ display: "flex", flexDirection: "column" }} key={`star${num}`}>
              <input type="checkbox" id={`star${6 - num}`} name="rating" checked={num <= rating} value={num} onChange={collectRate}></input>
              <label htmlFor={`star${num}`}>{num}</label>
            </div>
          ))}
        </div> */}
  
        <div className="rating" style={starStyle.rating}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div className={`star${num}`} style={{ display: "flex", flexDirection: "column" }} key={`star${num}`}>
              <input 
              type="checkbox" 
              id={`star${6 - num}`} 
              name="rating" 
              style={starStyle.input} 
              checked={num <= rating} 
              value={num} 
              onChange={collectRate} 
              onMouseEnter={() => handleHover(num)}
              onMouseLeave={handleMouseLeave}/>
              <label htmlFor="5" style={getLabelStyle(num)}>☆</label>
              {/* <label htmlFor={`star${num}`}>{num}</label> */}
            </div>
          ))}
        </div>

        {/* <div class="newrating">
          <input type="radio" name="rating" value="5" id="5" /><label for="5">☆</label>
          <input type="radio" name="rating" value="4" id="4" /><label for="4">☆</label>
          <input type="radio" name="rating" value="3" id="3" /><label for="3">☆</label>
          <input type="radio" name="rating" value="2" id="2" /><label for="2">☆</label>
          <input type="radio" name="rating" value="1" id="1" /><label for="1">☆</label>
        </div> */}

        {/* <div style={starStyle.body}>
          <div className="rating" style={starStyle.rating}>
            <input type="checkbox" style={starStyle.input} />
            <label style={starStyle.label}>☆</label>
            <input type="checkbox" style={starStyle.input} />
            <label style={starStyle.label}>☆</label>
            <input type="checkbox" style={starStyle.input} />
            <label style={starStyle.label}>☆</label>
          </div>
        </div> */}

        {/* <div className="newrating" style={starStyle.rating}>
          <input type="checkbox" name="rating" value="5" id="5" style={starStyle.input} />
          <label htmlFor="5" style={starStyle.label}>☆</label>
          <input type="checkbox" name="rating" value="4" id="4" style={starStyle.input} />
          <label htmlFor="4" style={starStyle.label}>☆☆</label>
          <input type="checkbox" name="rating" value="3" id="3" style={starStyle.input} />
          <label htmlFor="3" style={starStyle.label}>☆</label>
          <input type="checkbox" name="rating" value="2" id="2" style={starStyle.input} />
          <label htmlFor="2" style={starStyle.label}>☆</label>
          <input type="checkbox" name="rating" value="1" id="1" style={starStyle.input} />
          <label htmlFor="1" style={starStyle.label}>☆</label>
        </div> */}

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