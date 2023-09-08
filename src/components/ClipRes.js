import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import EluvioPlayer, { EluvioPlayerParameters } from "@eluvio/elv-player-js";

const container = {
  width: "97%",
  height: 900,
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

const videoTitleContainer = {
  width: "100%",
  height: "5%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const videoPlayerContainer = {
  width: "95%",
  height: "68%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoInfoContainer = {
  width: "95%",
  height: "27%",
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
  const clipRecorded = useRef(false);
  const url =
    props.clipInfo.url === null
      ? null
      : `${props.clipInfo.url}&resolve=false&clip_start=${
          props.clipInfo.start_time / 1000
        }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;
  const [player, setPlayer] = useState(undefined);
  const videoElementRef = useRef(undefined);

  useEffect(() => {
    return () => {
      if (player) {
        player.Destroy();
      }
    };
  }, []);

  useEffect(() => {
    prepareShots()
      .then(() => {
        // console.log(shots.current);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const hash = (s) => {
    return s;
  };

  const prepareShots = async () => {
    if (props.db !== null) {
      try {
        const shotInfoRef = collection(props.db, "Shot_info");
        const _hasTags =
          "f_start_time" in props.clipInfo.sources[0].fields &&
          "f_end_time" in props.clipInfo.sources[0].fields;
        if (_hasTags) {
          const iqHash = props.clipInfo.hash;
          for (let src of props.clipInfo.sources) {
            const currdoc = src.fields;
            const shotID = hash(
              iqHash + "_" + currdoc.f_start_time + "-" + currdoc.f_end_time
            );
            const shotRef = doc(shotInfoRef, shotID);
            getDoc(shotRef).then((shot) => {
              if (shot.exists()) {
                shots.current[shotID] = shot.data();
              }
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleStart = (time) => {
    startTime.current = time;
    console.log(`started, starttime: ${startTime.current}`);
  };

  const handlePause = (time) => {
    const elapsedTime = time - startTime.current;
    viewTime.current = viewTime.current + elapsedTime;
    console.log(
      `paused, elapsedtime: ${elapsedTime}, total view time: ${viewTime.current}`
    );

    // startTime.current = null;
    try {
      if (!clipRecorded.current) {
        props.updateEngagement(clipInfo, elapsedTime, 1);
        clipRecorded.current = true;
      } else {
        props.updateEngagement(clipInfo, elapsedTime, 0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const InitializeVideo = ({ element }) => {
    if (!element || player) {
      return;
    }

    setPlayer(
      new EluvioPlayer(element, {
        clientOptions: {
          network:
            EluvioPlayerParameters.networks[
              props.network === "main" ? "MAIN" : "DEMO"
            ],
          client: props.client,
        },
        sourceOptions: {
          playoutParameters: {
            versionHash: props.clipInfo.hash,
            clipStart: props.clipInfo.start_time / 1000,
            clipEnd: props.clipInfo.end_time / 1000,
            ignoreTrimming: true,
          },
        },
        playerOptions: {
          controls: EluvioPlayerParameters.controls.AUTO_HIDE,
          playerCallback: ({ videoElement }) => {
            videoElementRef.current = videoElement;
            videoElement.style.height = "100%";
            videoElement.style.width = "100%";
            videoElement.addEventListener("play", () => {
              handleStart(videoElement.currentTime);
            });
            videoElement.addEventListener("pause", () => {
              handlePause(videoElement.currentTime);
            });
            videoElement.addEventListener("seeking", () => {
              if (!videoElement.paused) {
                videoElement.pause();
              }
            });
          },
        },
      })
    );
  };

  return (
    <div style={container}>
      <div style={videoContainer}>
        <div style={videoTitleContainer}>
          {props.clipInfo.meta.public.asset_metadata.title}
        </div>
        <div style={videoPlayerContainer}>
          {url !== null ? (
            <div ref={(element) => InitializeVideo({ element })}></div>
          ) : (
            <div
              style={{
                width: "auto",
                height: "100%",
                backgroundColor: "transparent",
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
        searchID={props.searchID}
        prevS={shots}
        videoElementRef={videoElementRef}
        searchVersion={props.searchVersion}
      ></QAPad>
    </div>
  );
};

export default ClipRes;
