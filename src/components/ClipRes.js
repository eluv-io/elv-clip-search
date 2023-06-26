import React, { useRef, useState } from "react";
import ReactHlsPlayer from "react-hls-player";
import {
  getFirestore, collection, getDoc, addDoc, doc, updateDoc, query, where, get, getDocs, setDoc, Timestamp
} from 'firebase/firestore' ;


const body = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10,
  borderRadius: 10,
  width: "96%",
};

const info = {
  display: " flex",
  flexDirection: "column",
  width: "100%",
  height: "20%",
  margin: "2%",
  alignItems: "center",
  justifyContent: "center",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "95%",
  height: "8%",
  marginTop: "0.5%",
};

const longInfo = {
  width: "95%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const videoPlayer = {
  width: "90%",
  height: "70%",
  marginTop: "2%",
  flexDirection: "colomn",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const buttonInfo = {
  display: "flex",
  flexDirection: "row"
}

const feedback = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
  // justifyContent: "center"
}

const options = [
  { value: "1", label: "Movie scene matched to speech text" },
  { value: "2", label: "Speech text matched to movie scene" },
  { value: "3", label: "Object misrecognition" },
  { value: "4", label: "Typos recognized as actual words" },
  { value: "5", label: "None of the above"}
];

const Feedback = (props) => {
  const [submitted, setSubmitted] = useState(false);
  const [wantinput, setWantinput] = useState(false);
  const otherreasons = useRef(null);
  const reason = useRef(null);
  const rating = useRef(null);
  const db = props.db;
  const clientadd = props.clientadd;
  const colRef = collection(db, 'Books'); //TODO change it to Feedback

  const collectRate = async (event) => {
    const selectedRating = event.target.value;
    rating.current = selectedRating;
  }

  const collectOption = (event) => {
    const selectedValue = event.target.value;
    const label = options.find((option) => option.value === selectedValue).label;
    reason.current = label;
    if (selectedValue === "5") {
      setWantinput(true);
    } else {
      setWantinput(false);
    }
  }

  const collectOtherreason = (event) => {
    const textareaData = document.getElementById('reason_input').value;
    otherreasons.current = textareaData;
  }

  const Submit = async () => {
    const now = Timestamp.now().toDate().toString();
    console.log(Timestamp.now());
    console.log(now);
    const docRef = await doc(colRef, clientadd + "_" + now);
    setDoc(docRef, {client: clientadd, 
                    feedback_time: now,
                    rating: rating.current,
                    reason: reason.current, 
                    other_reasons: otherreasons.current}).then(() => {
      console.log("Feedback collected successfully!");
    })


    const textElement = document.getElementById('reason_input');
    if (textElement !== null) {
      textElement.remove();
    }
    document.getElementById('choices').remove();
    

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
            <input type="radio" id={`star${6 - num}`} name="rating" value={num} onChange={collectRate}></input>
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
            onChange={(event) => collectOtherreason(event.target.value)}></textarea>
          </div>
        ): null}
            

        <button onClick={Submit}>Submit</button>
        {submitted ? (
          <div id='submissiontxt' style={{display: 'flex'}}>Thanks for your feedback</div>
        ): null}
        
      </div>
    </div>
  )

}

const ClipRes = (props) => {

  const db = props.db;
  const clientadd = props.clientadd;
  const colRef = collection(db, 'Books'); //TODO change it to Feedback
    console.log('collection reference:', colRef);


  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;
  return (
    <div style={body}>
      <div style={videoPlayer}>
        <ReactHlsPlayer
          src={url}
          width="100%"
          height="auto"
          autoPlay={false}
          controls={true}
          hlsConfig={{
            capLevelToPlayerSize: true,
            maxBufferLength: 1,
          }}
        ></ReactHlsPlayer>
      </div>
      <div style={info}>
        <div style={shortInfo}>
          <div>title: </div>
          <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
        </div>
        <div style={shortInfo}>
          <div>library id: </div>
          <div>{props.clipInfo.qlib_id}</div>
        </div>
        <div style={shortInfo}>
          <div>content id: </div>
          <div>{props.clipInfo.id}</div>
        </div>
        <div style={shortInfo}>
          <div>start_time: </div>
          <div>{props.clipInfo.start}</div>
        </div>
        <div style={shortInfo}>
          <div>end_time: </div>
          <div>{props.clipInfo.end}</div>
        </div>
        <div style={longInfo}>
          <div>playout url</div>
          <textarea
            name="playout url"
            value={url}
            style={{
              height: "100%",
              width: "100%",
              padding: 5,
              borderStyle: "None",
              borderRadius: 10,
            }}
            readOnly
          ></textarea>
        </div>
      </div>

      <Feedback 
        db = {db}
        clientadd = {clientadd}
      ></Feedback>
    </div>
  );
};

export default ClipRes;
