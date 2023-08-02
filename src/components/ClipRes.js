import ReactPlayer from "react-player";
import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import EluvioPlayer, { EluvioPlayerParameters } from "@eluvio/elv-player-js";


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
  marginTop: "2%",
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const audioCtrlContainer = {
  display: " flex",
  flexDirection: "row",
  width: "100%",
  height: "5%",
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
  const clipRecorded = useRef(false);

  useEffect(() => {
    prepareShots().then(() => {
      console.log(shots.current)
    });
  }, [])

  const hash = (s) => {
    return s;
  };

  const prepareShots = async () => {
    if (props.db !== null) {
      try {
        const shotInfoRef = collection(props.db, "Shot_info");
        const _hasTags = "text" in props.clipInfo.sources[0].document;
        if (_hasTags) {
          const iqHash = props.clipInfo.hash;
          for (let src of props.clipInfo.sources) {
            const currdoc = src.document;
            const shotID = hash(iqHash + "_" + currdoc.start_time + "-" + currdoc.end_time);
            const shotRef = doc(shotInfoRef, shotID);
            getDoc(shotRef).then((shot) => {
              if (shot.exists()) {
                shots.current[shotID] = shot.data();
              }
            });
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  };

  const handleStart = () => {
    try {
    props.updateEngagement(clipInfo, 0, 1);
    } catch (err) {
      console.log(err)
    }
    console.log("Started");

  };

  // const handleTimeUpdate = (video) => {
  //   cumTime.current += 
  // }

  const handlePlay = (video) => {
    console.log(video.currentTime)
    startTime.current = video.currentTime;
    console.log(startTime.current)
  };

  const dislikedTags = useRef([]);


  const handlePause = (video) => {
    const elapsedTime = video.currentTime - startTime.current;
    console.log("elapsedtime", elapsedTime)
    viewTime.current = viewTime.current + elapsedTime;
    // startTime.current = null;
    try {
      if (!clipRecorded.current) {
        props.updateEngagement(clipInfo, elapsedTime, 1);
        clipRecorded.current = true;
      } else{
        props.updateEngagement(clipInfo, elapsedTime, 0);
      }
    } catch (err) {
      console.log(err)
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
  const [player, setPlayer] = useState(undefined);

  useEffect(() => {
    return () => {
      if (player) {
        player.Destroy();
      }
    };
  }, []);

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
            ignoreTrimming: true
          },
        },
        playerOptions: {
          controls: EluvioPlayerParameters.controls.AUTO_HIDE,
          playerCallback: ({player, videoElement, hlsPlayer, dashPlayer, posterUrl}) => {
            videoElement.addEventListener("play", () => handlePlay(videoElement));
            videoElement.addEventListener("pause", () => handlePause(videoElement));
            videoElement.addEventListener("ended", () => handlePause(videoElement));
          }
        },
      })
    );
  };

 
  const playerRef = useRef(null);
  const [audioTracks, setAudioTracks] = useState(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(0);
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
          <div ref={(element) => InitializeVideo({ element })}></div>
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

      {audioTracks && (
        <div style={audioCtrlContainer}>
          audio track:
          <select
            onChange={(event) => {
              const audioTrackId = event.target.value;
              setSelectedAudioTrack(audioTrackId);
              console.log(`set audio track to ${audioTrackId}`);
              const hls = playerRef.current.getInternalPlayer("hls");
              hls.audioTrackController.setAudioTrack(audioTrackId);
            }}
            value={selectedAudioTrack}
            style={{ height: "100%", width: "20%", marginLeft: 5 }}
          >
            {audioTracks.map((track) => {
              return (
                <option key={`option-${track.id}`} value={track.id}>
                  {track.name}
                </option>
              );
            })}
          </select>
        </div>
      )}
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
          if (shotID in shots.current) {
            shots.current[shotID].tags[i].feedback[props.searchID.current] = score;
          }
        }}
        initializePrevShots={(shotID, tag) => {
          shots.current[shotID].tags.push(tag);
        }}
        prevShots={shots.current}
        setShots={(s) => {
          shots.current = s
        }}
        prevS={shots}
      ></QAPad>

    </div>
  );
};

export default ClipRes;
