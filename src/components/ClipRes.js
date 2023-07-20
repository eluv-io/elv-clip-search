import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { collection, doc, getDoc } from "firebase/firestore";

const container = {
  width: "97%",
  height: 800,
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

const videoPlayerContainer = {
  width: "95%",
  height: "70%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfoContainer = {
  width: "95%",
  height: "30%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};


const ClipRes = (props) => {

  const viewTime = useRef(0);
  const startTime = useRef(null);
  const clipInfo = props.clipInfo;
  const shots = useRef({});

  useEffect(() => {
    prepareShots();
  }, [])

  const hash = (s) => {
    return s;
  };

  const prepareShots = async () => {
    const shotInfoRef = collection(props.db, "Shot_info");
    const _hasTags = "text" in props.clipInfo.sources[0].document;
    if (_hasTags) {
      const iqHash = props.clipInfo.hash;
      for (let src of props.clipInfo.sources) {
        const currdoc = src.document;
        const shotID = hash(iqHash + currdoc.start_time + "-" + currdoc.end_time);
        const shotRef = doc(shotInfoRef, shotID);
        getDoc(shotRef).then((shot) => {
          if (shot.exists()) {
            console.log(shotID);
            console.log(shot.data())
            shots.current[shotID] = shot.data();
          }
        });
      }
    }
  };

  const handleStart = () => {
    props.updateEngagement(clipInfo, 0, 1);
    console.log("Started");

  };

  const handlePlay = () => {
    startTime.current = Date.now();
  };

  const dislikedTags = useRef([]);


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

  const url =
    props.clipInfo.url === null
      ? null
      : `${props.clipInfo.url}&resolve=false&clip_start=${
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
            height: "5%",
            fontWeight: "bold",
          }}
        >
          {props.clipInfo.meta.public.asset_metadata.title}
        </div>
        <div style={videoPlayerContainer}>
        {url !== null ? (
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
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Playout URL Err
          </div>
        )}
        </div>

        <div style={videoInfoContainer}>
          <InfoPad
            clipInfo={props.clipInfo}
            db={props.db}
            clientadd={props.clientadd}
            searchID={props.searchID}
            viewTime={viewTime.current}
            contents={props.contents}
            searchVersion={props.searchVersion}
          ></InfoPad>
        </div>
      </div>

      <QAPad
        clipInfo={props.clipInfo}
        db={props.db}
        clientadd={props.clientadd}
        searchID={props.searchID}
        viewTime={viewTime.current}
        contents={props.contents}
        dislikedTags={dislikedTags.current}
        dislikeTagHook={(id) => {
          dislikedTags.current.push(id);
        }}
        updatePrevShots={(shotID, i, score) => {
          shots.current[shotID].tags[i].feedback[props.searchID] = score;
        }}
        prevShots={shots.current}
      ></QAPad>
    </div>
  );
};

export default ClipRes;
