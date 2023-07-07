import Feedback from "./Feedback";
import React, { useRef, useState } from "react";
import ReactPlayer from 'react-player';
import { isEqual } from 'lodash';

const container = {
  width: "97%",
  height: 600,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
  marginTop: 10,
};

const videoContainer = {
  width: "75%",
  height: "95%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "whitesmoke",
  borderRadius: 10,
};

const videoPlayer = {
  width: "95%",
  height: "80%",
  marginBottom: "1%",
  marginTop: "1%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfo = {
  width: "95%",
  height: "20%",
  display: " flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
};

const feedBack = {
  width: "95%",
  height: "20%",
  display: " flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
}

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  flex: 1,
};

const longInfo = {
  width: "95%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const tagsContainer = {
  width: "25%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
};

const tags = { //TODO can i use const
  "Celebrity Detection": [],
  "Landmark Recognition": [],
  "Logo Detection": [],
  "Object Detection": [],
  "Optical Character Recognition": [],
  "Segment Labels": [],
  "Speech to Text": [],
};

const feedback = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: 220
}

const TagsPad = (props) => {
  
  const tagsMap = {
    "Celebrity Detection": "Celebrity",
    "Landmark Recognition": "LandMark",
    "Logo Detection": "logo",
    "Object Detection": "Object",
    "Optical Character Recognition": "OCR",
    "Segment Labels": "Segment",
    "Speech to Text": "STT",
  };

  const [show, setShow] = useState({
    "Celebrity Detection": true,
    "Landmark Recognition": true,
    "Logo Detection": true,
    "Object Detection": true,
    "Optical Character Recognition": true,
    "Segment Labels": true,
    "Speech to Text": true,
  });


  const thumbsUp = (lst, t) => {
    const idx = lst.findIndex(dic => isEqual(dic, t));
    lst[idx] = {[Object.keys(t)]: "like"};
    console.log("You liked me")
  }

  const thumbsDown = (lst, t) => {
    const idx = lst.findIndex(dic => isEqual(dic, t));
    lst[idx] = {[Object.keys(t)]: "dislike"};
    console.log("You disliked me")
  }

  const hasTags = "text" in props.clipInfo.sources[0].document;

  if (hasTags) {
    for (let src of props.clipInfo.sources) {
      const doc = src.document;
      for (let k in tags) {
        for (let v of doc.text[k]) {
          for (let text of v.text) {
            const dic = {[text]: null};
            // console.log(dic)
            const found = tags[k].some(dictionary => JSON.stringify(dic) === JSON.stringify(dictionary));
            if (!found) {
              tags[k].push(dic);
            }
            // if (!tags[k].includes(text)) {
            //   // tags[k].push({text: null});
            //   tags[k].push(text);
            // }
          }
        }
      }
    }
    
    // for (const k in tags) {
    //   // Modify the element
    //   const temp = tags[k].map(x => ({[x]: null}));
    //   console.log(typeof(temp))
    //   // const temp = tags[k].map(x => ({x: null}))
    //   for (let j = 0; j < tags[k].length; j++) {
    //     const temp = tags[k][j];
    //     // console.log(temp);
    //     tags[k][j] = {[tags[k][j]]: null};
    //     // console.log(tags[k], tags[k][j])
    //   }
    // }
  }

  return (
    <div
      style={{
        width: "100%",
        maxHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflowY: "scroll",
        scrollbarWidth: "thin",
      }}
    >
      {Object.keys(tags).map((k) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "95%",
              marginBottom: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                backgroundColor: "lightgray",
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 5,
                paddingRight: 5,
                borderRadius: 5,
              }}
            >
              <div>{tagsMap[k]}</div>
              <button
                style={{ border: "none", backgroundColor: "lightgray" }}
                onClick={() => {
                  const newStatus = {};
                  for (let kk in show) {
                    if (kk === k) {
                      newStatus[kk] = !show[kk];
                    } else {
                      newStatus[kk] = show[kk];
                    }
                  }

                  setShow(newStatus);
                }}
              >
                {show[k] ? "⏫️" : "👀"}
              </button>
            </div>
            {show[k] &&
              tags[k].map((t) => (
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingLeft: "5%",
                    backgroundColor: "#E6E6E6",
                    borderRadius: 10,
                    marginBottom: 3,
                  }}
                >
                  {Object.keys(t)}
                  {/* {t} */}
                  <div> 
                    <button style={{border:"none", backgroundColor: "#E6E6E6"}} onClick={() => thumbsUp(tags[k], t)}>👍</button>
                    <button style={{border:"none", backgroundColor: "#E6E6E6"}} onClick={() => thumbsDown(tags[k], t)}>👎</button>
                  </div>
                  
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};


const ClipRes = (props) => {

  const viewTime = useRef(0);
  const startTime = useRef(null);
 
  const handlePlay = () => {
    startTime.current = Date.now();
  }
  const handlePause = () => {
    if (startTime.current) {
      const elapsedTime = (Date.now() - startTime.current) / 1000;
      viewTime.current = viewTime.current + elapsedTime;
      startTime.current = null;
    }
    console.log("total view time", viewTime.current);
  }

  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;

  const hasTags = "text" in props.clipInfo.sources[0].document;

  return (
    <div style={container}>
      <div style={{ ...videoContainer, width: hasTags ? "80%" : "100%" }}>
        <div style={videoPlayer}>
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            autoPlay={false}
            controls={true}
            config={{
                capLevelToPlayerSize: true,
                maxBufferLength: 1
            }}
            // onProgress={handleProgress}
            onPlay={handlePlay}
            onPause={handlePause}
          ></ReactPlayer>
        </div>
        <div style={videoInfo}>
          <div style={shortInfo}>
            <div>title: </div>
            <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
          </div>

          <div style={shortInfo}>
            <div>content id: </div>
            <div>{props.clipInfo.id}</div>
          </div>

          <div style={shortInfo}>
            <div>time interval: </div>
            <div>{props.clipInfo.start} - {props.clipInfo.end}</div>
          </div>

          {props.searchVersion === "v2" ? (
            <div style={shortInfo}>
            <div>rank: </div>
            <div>{props.clipInfo.rank}</div>
          </div>
          ): null}
        </div>
        
      </div>

      <div style={tagsContainer}>
        <div style={{width: "100%",
        height: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "white"
        }}>
        <TagsPad clipInfo={props.clipInfo}></TagsPad>
        </div>

        <div style={feedback}>
          <Feedback 
            db = {props.db}
            clientadd = {props.clientadd}
            searchID = {props.searchID}
            viewTime = {viewTime.current}
            clipInfo = {props.clipInfo}
            contents = {props.contents}
            tags = {tags}
          ></Feedback>
        </div>
      </div>
    </div>
  );
};

export default ClipRes;
