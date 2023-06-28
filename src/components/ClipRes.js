import Feedback from "./Feedback";
import React, { useRef, useState } from "react";
import { collection } from 'firebase/firestore';
import ReactPlayer from 'react-player';



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


const ClipRes = (props) => {

  const db = props.db;
  const clientadd = props.clientadd;
  const colRef = collection(db, 'Books'); //TODO change it to Feedback
    console.log('collection reference:', colRef);
  // const [viewTime, setViewTime] = useState(0);
  const viewTime = useRef(0);
  const startTime = useRef(null);
  // const formattedViewTime = typeof(viewTime) === 'number' ? viewTime.toFixed(2) : '0.00';

  const handleProgress = (time) => {
    viewTime.current = time.playedSeconds;
    // console.log(viewTime.current);
    // console.log("formatted view time", formattedViewTime);
  }

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
  return (
    <div style={body}>
      <div style={videoPlayer}>
        <ReactPlayer
          url={url}
          src={url}
          width="100%"
          height="auto"
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
          <div>time interval </div>
          <div>{props.clipInfo.start} - {props.clipInfo.end}</div>
        </div>
        <div style={longInfo}>
          
          <a href={url} name="playout url" target="_blank">playout url</a>
          <p></p>
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
