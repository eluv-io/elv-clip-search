import React, { useEffect, useRef, useState } from "react";
import { collection, doc, setDoc, Timestamp, where, query, getDocs, orderBy, limit, get } from "firebase/firestore";

import { BiStar, BiSolidStar } from "react-icons/bi";

const feedback = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "90%",
  width: "90%",
};

const options = [
  { value: 0, label: "Please choose a reason" },
  { value: 1, label: "Clip is irrelevant" },
  { value: 2, label: "Clip is offensive" },
  { value: 3, label: "Perfect Match!"},
  { value: 4, label: "Others.." }
];

const starStyle = {
  body: {
    background: "#222225",
    color: "white",
    margin: "20px auto",
  },
  rating: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  input: {
    display: "flex",
  },
  label: {
    position: "relative",
    width: "1em",
    fontSize: "3vw",
    color: "black",
    cursor: "pointer",
  },
};

const Feedback = (props) => {
  const [wantinput, setWantinput] = useState(false);
  const otherreasons = useRef("");
  const [reason, setReason] = useState("");
  const hasReason = useRef(false);
  const [rating, setRating] = useState(0);
  const hasRating = useRef(false);
  const prevOtherReason = useRef(null);

  const db = props.db;
  const clientadd = props.clientadd;
  const clipInfo = props.clipInfo;
  const feedbackRef = collection(db, "Feedback");
  const clipStart = clipInfo.start;
  const clipEnd = clipInfo.end;
  const contentHash = clipInfo.hash;
  const clipHash = contentHash + "_" + clipStart + "-" + clipEnd;

  
  useEffect(() => {
    const userRef = collection(db, "Feedback", clientadd, "Data");
    
    const q = query(userRef, where("clipHash", "==", clipHash), orderBy("feedback_time", "desc"), limit(1));

    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        otherreasons.current = data.other_reasons
        setReason(data.reason);
        setRating(data.rating);
      });
    })
  }, []);

  const handleRateChange = (num) => {
    const selectedRating = num;
    hasRating.current = true;
    const active = [];
    for (var i = 0; i <= num; i++) {
      active.push(i);
    }
    setRating(selectedRating);
    submit(num);
    const submissionElement = document.getElementById("submissiontxt");
    submissionElement.style.display = "none";
  };

  const collectOption = (event) => {
    const selectedValue = parseInt(event.target.value);
    var label;
    console.log(selectedValue);
    if (selectedValue !== 0) {
      label = options.find((option) => option.value === selectedValue).label;
    }
    setReason(label);
    if (selectedValue === 4) {
      setWantinput(true);
    } else {
      setWantinput(false);
    }
    hasReason.current = true;
    //TODO Let "thank you" disappear when selecting reasons again
    const submissionElement = document.getElementById("submissiontxt");
    submissionElement.style.display = "none";
  };

  const collectOtherReason = (event) => {
    const textareaData = document.getElementById("reason_input").value;
    otherreasons.current = textareaData;
  };

  const submit = async (score) => {
    //storing the feedback
    const warningElement = document.getElementById("warning");
    const submissionElement = document.getElementById("submissiontxt");
    if (!(hasRating.current || hasReason.current)) {
      warningElement.style.display = "flex";
    } else {
      if (warningElement.style.display === "flex") {
        warningElement.style.display = "none";
      }
      const now = Timestamp.now().toDate().toString().replace(/\([^()]*\)/g, ""); 
      // TODO delete all the "async"
      const userRef = collection(db, "Feedback", clientadd, "Data");
      
      const docRef = doc(userRef, now);

      setDoc(docRef, {
        client: clientadd,
        feedback_time: new Date(now),
        rating: score,
        clipHash: contentHash + "_" + clipStart + "-" + clipEnd,
        reason: reason,
        other_reasons: otherreasons.current,
        search_id: props.searchID
      }).then(() => {
        console.log("Feedback collected successfully!");
      });

      const textElement = document.getElementById("reason_input");
      if (textElement !== null) {
        textElement.style.display = "none"
      }

      submissionElement.style.display = "flex";
    }
  };

  return (
    <div style={feedback}>
      {/* <div>rate me</div> */}

      <div className="rating" style={starStyle.rating}>
        {[1, 2, 3, 4, 5].map((num) => (
          <div
            className={`star${num}`}
            style={{ display: "flex", flexDirection: "column" }}
            key={`star${num}`}
          >
            <button
              onClick={() => {
                // collectRate(num);
                handleRateChange(num);
              }}
              style={{ border: "none", backgroundColor: "transparent" }}
            >
              {num <= rating ? <BiSolidStar /> : <BiStar />}
            </button>
          </div>
        ))}
      </div>

      <div>How do you like the search result?</div>
      <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
        <div
          style={{ display: "flex", width: "100%", flexDirection: "column" }}
        >
          <select id="choices" onChange={collectOption} value={reason}>
            {options.map((option) => (
              <option
                key={option.label}
                value={option.value}
                style={{ width: "100%" }}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {wantinput ? (
          <textarea
            id="reason_input"
            name="freeform"
            rows="2"
            cols="30"
            placeholder="Tell us your thoughts..."
            value={prevOtherReason.current}
            onChange={(event) => collectOtherReason(event.target.value)}
            style={{ width: "100%" }}
          ></textarea>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1%",
          marginBottom: "1%",
        }}
      >
        <button onClick={() => {submit(rating)}}>Submit</button>
      </div>

      <div
        id="warning"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "3%",
          marginBottom: "1%",
        }}
      >
        Please give us your feedback
      </div>
      <div
        id="submissiontxt"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Thanks for your feedback!
      </div>
    </div>
  );
};

export default Feedback;
