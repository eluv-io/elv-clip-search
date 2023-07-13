import QAPad from "./QAPad";
import React, { useRef } from "react";
import ReactPlayer from "react-player";

const container = {
  width: "97%",
  height: 700,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "whitesmoke",
  padding: 10,
  marginBottom: 10,
  marginTop: 10,
};

const videoContainer = {
  width: "80%",
  height: "95%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  borderRadius: 10,
};

const videoPlayer = {
  width: "95%",
  height: "80%",
  marginTop: "1%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfo = {
  width: "95%",
  height: "18%",
  display: " flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  flex: 1,
};

const ClipRes = (props) => {
  const viewTime = useRef(0);
  const startTime = useRef(null);
  const clipInfo = props.clipInfo;

  const handleStart = () => {
    props.updateEngagement(clipInfo, 0, 1);
    console.log("Started");
  };

  const handlePlay = () => {
    startTime.current = Date.now();
  };

  const handlePause = () => {
    if (startTime.current) {
      const elapsedTime = (Date.now() - startTime.current) / 1000;
      viewTime.current = viewTime.current + elapsedTime;
      startTime.current = null;
      props.updateEngagement(clipInfo, elapsedTime, 0);
    }
    console.log("paused");
    console.log("total view time", viewTime.current);
  };

  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;

  return (
    <div style={container}>
      <div style={videoContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            fontWeight: "bold",
          }}
        >
          {props.clipInfo.meta.public.asset_metadata.title}
        </div>
        <div style={videoPlayer}>
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            autoPlay={false}
            controls={true}
            config={{
              capLevelToPlayerSize: true,
              maxBufferLength: 1,
            }}
            onStart={handleStart}
            onPlay={handlePlay}
            onPause={handlePause}
          ></ReactPlayer>
        </div>
        <div style={videoInfo}>
          <div style={shortInfo}>
            <div>content id: </div>
            <div>{props.clipInfo.id}</div>
          </div>

          <div style={shortInfo}>
            <div>time interval: </div>
            <div>
              {props.clipInfo.start} - {props.clipInfo.end}
            </div>
          </div>

          {props.searchVersion === "v2" ? (
            <div style={shortInfo}>
              <div>rank: </div>
              <div>{props.clipInfo.rank}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* <div style={QAContainer}> */}
      <QAPad
        clipInfo={props.clipInfo}
        db={props.db}
        clientadd={props.clientadd}
        searchID={props.searchID}
        viewTime={viewTime.current}
        contents={props.contents}
      ></QAPad>
      {/* </div> */}
    </div>
  );
};

export default ClipRes;
