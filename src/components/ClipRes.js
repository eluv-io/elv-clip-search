import React, { useState } from "react";
import ReactHlsPlayer from "react-hls-player";
import {
  getFirestore, collection, getDoc, addDoc, doc, updateDoc, query, where, get, getDocs
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
  flexDirection: "column"
}

const options = [
  { value: "1", label: "Movie scene matched to speech text" },
  { value: "2", label: "Speech text matched to movie scene" },
  { value: "3", label: "Object misrecognition" },
  { value: "4", label: "Typos recognized as actual words" }
];


const ClipRes = (props) => {

  const [like, setLike] = useState(false);
  const [dislike, setdisLike] = useState(false);
  const [otherreasons, setOtherreasons] = useState("Other reasons...");
  const db = props.db;
  const clientadd = props.clientadd;
  const colRef = collection(db, 'Books'); //TODO change it to Feedback
    console.log('collection reference:', colRef);

  const q = query(colRef, where("client", "==", clientadd));

  const resetButton = () => {
    setLike(false);
    setdisLike(false);
    document.getElementById("likebutton").style.backgroundColor="";
    document.getElementById("dislikebutton").style.backgroundColor="";

    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((document) => {
          console.log(document.id);
          const docRef = doc(colRef, document.id);
          const updateData = {
            like_dislike: null,
            reason: null
          };
          updateDoc(docRef, updateData).then(() => {
            console.log("Client status cleared");
          })
        });
      }
    })
  }

  const thumbsDownClicked = async () => {
    console.log('Thumbs down clicked');
    resetButton();
    if (dislike === false) {
      setdisLike(true);
      document.getElementById("dislikebutton").style.backgroundColor="#911";

      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
          const newData = {
            client: clientadd,
            like_dislike: "Dislike"
          };
          addDoc(colRef, newData).then((docRef) => {
            console.log("New client added with document reference", docRef);
          })
        } else {
          querySnapshot.forEach((document) => {
            console.log(document.id);
            const docRef = doc(colRef, document.id);
            const updateData = {
              like_dislike: "Dislike"
            };
            updateDoc(docRef, updateData).then(() => {
              console.log("Like/dislike updated successfully");
            })
          });
        }
      })
    }
  }
  
  const thumbsUpClicked = async () => {
    console.log('Thumbs up clicked');
    resetButton();
    if (like === false) {
      setLike(true);
      document.getElementById("likebutton").style.backgroundColor="#34568B";

      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
          const newData = {
            client: clientadd,
            like_dislike: "Like"
          };
          addDoc(colRef, newData).then((docRef) => {
            console.log("New client added with document reference", docRef);
          })
        } else {
          querySnapshot.forEach((document) => {
            console.log(document.id);
            const docRef = doc(colRef, document.id);
            const updateData = {
              like_dislike: "Like"
            };
            updateDoc(docRef, updateData).then(() => {
              console.log("Like/dislike updated successfully");
            })
          });
        }
      })
    }
  };

  const collectRate = async (event) => {
    const selectedRating = event.target.value;
    getDocs(q).then((querySnapshot) => {
      if (querySnapshot.empty) {
        const newData = {
          client: clientadd,
          rating: selectedRating
        };
        addDoc(colRef, newData).then((docRef) => {
          console.log("New client added with document reference", docRef);
        })
      } else {
        querySnapshot.forEach((document) => {
          console.log(document.id);
          const docRef = doc(colRef, document.id);
          const updateData = {
            rating: selectedRating
          };
          updateDoc(docRef, updateData).then(() => {
            console.log("Rating updated successfully");
          })
        });
      }
    })
  }

  const collectOption = (event) => {
    const selectedValue = event.target.value;
    getDocs(q).then((querySnapshot) => {
      if (querySnapshot.empty) {
        const newData = {
          client: clientadd,
          reason: selectedValue
        };
        addDoc(colRef, newData).then((docRef) => {
          console.log("New client added with document reference", docRef);
        })
      } else {
        querySnapshot.forEach((document) => {
          console.log(document.id);
          const docRef = doc(colRef, document.id);
          const updateData = {
            reason: selectedValue
          };
          updateDoc(docRef, updateData).then(() => {
            console.log("Reason updated successfully");
          })
        });
      }
    })
  }

  const collectText = () => {
    const textareaData = document.getElementById('reason_input').value;
    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((document) => {
          console.log(document.id);
          const docRef = doc(colRef, document.id);
          const updateData = {
            reason: textareaData
          };
          updateDoc(docRef, updateData).then(() => {
            console.log("Reason updated successfully");
          })
        });
      }
    })
  }

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
        {/* <div style={shortInfo}>
          <div>title: </div>
          <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
        </div> */}
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
        <div style={feedback}>
          {/* <div>rate me</div> */}
          <br></br>

          {/* thums up and down */}
          <div style={buttonInfo}>
            <button id='likebutton' onClick={thumbsUpClicked}>👍</button>
            <button id='dislikebutton' onClick={thumbsDownClicked}>👎</button>
          </div>

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

        </div>
      </div>

      <div>
        {like ? (
          <div id='liketxt' style={{display: 'flex'}}>Thanks for your feedback</div>
        ) : dislike ? (
          <div style = {{flexDirection: "column"}}>
            {/* <div id='disliketxt' style={{display: 'flex'}}>We value your feedback:</div> */}
            <select id="choices" onChange={collectOption}>
              {/* <option value="1">Movie scene matched to speech text</option>
              <option value="2">Speech text matched to movie scene</option>
              <option value="3">Object misrecognition</option>
              <option value="4">Typos recognized as actual words</option> */}
              {options.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            <div style = {{flexDirection: "column"}}>
              <textarea 
              id="reason_input"
              name="freeform"
              rows="4" cols="30" 
              value={otherreasons}
              onChange={(event) => setOtherreasons(event.target.value)}>Other reasons...</textarea>
              <button onClick={collectText}>Submit</button>
            </div>
          </div>
        ): null}
      </div>
    </div>
  );
};

export default ClipRes;
