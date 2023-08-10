import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef, useState } from "react";
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
  const shotsMemo = useRef({});
  const viewed = useRef(false);
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

  useEffect(() => {
    if ("text" in props.clipInfo.sources[0].document) {
      for (let src of props.clipInfo.sources) {
        const currdoc = src.document;
        const shotId = `${props.clipInfo.hash}_${currdoc.start_time}-${currdoc.end_time}`;
        shotsMemo.current[shotId] = null;
      }
    }
  }, []);

  const handleStart = (time) => {
    startTime.current = time;
    console.log(`started, starttime: ${startTime.current}`);
  };

  const handlePause = (time) => {
    if (
      props.searchId !== null &&
      props.dbClient !== null &&
      (props.searchVersion === "v1" ||
        (props.searchVersion === "v2" && props.clipInfo.rank <= 20))
    ) {
      const clipId = `${props.clipInfo.hash}_${props.clipInfo.start}-${props.clipInfo.end}`;
      // if already played, we won't count it again
      let numView = 0;
      if (!viewed.current) {
        numView = 1;
        viewed.current = true;
      }
      // get the elapsed time since last time we click play
      const elapsedTime = time - startTime.current;
      const newWatchedTime =
        elapsedTime + props.engagement.current[clipId].watchedTime;
      const newNumView = numView + props.engagement.current[clipId].numView;
      props.engagement.current[clipId] = {
        numView: newNumView,
        watchedTime: newWatchedTime,
      };
      props.dbClient.setEngagement({
        searchId: props.searchId,
        clientAddr: props.clientAddr,
        engagement: props.engagement.current,
        init: false,
      });
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
            dbClient={props.dbClient}
            clientAddr={props.clientAddr}
            searchId={props.searchId}
            viewTime={viewTime.current}
            contents={props.contents}
            searchVersion={props.searchVersion}
          ></InfoPad>
        </div>
      </div>

      <QAPad
        clipInfo={props.clipInfo}
        searchId={props.searchId}
        shotsMemo={shotsMemo}
        dbClient={props.dbClient}
      ></QAPad>
    </div>
  );
};

export default ClipRes;
