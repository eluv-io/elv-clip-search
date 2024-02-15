import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef, useState } from "react";
import EluvioPlayer, { EluvioPlayerParameters } from "@eluvio/elv-player-js";
import { getDownloadUrlWithMaxResolution, getEmbedUrl } from "../utils";
const container = {
  width: "97%",
  height: 900,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  // backgroundColor: "whitesmoke",
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
  // backgroundColor: "whitesmoke",
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
  const [imgUrl, setImgUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("")
  const [loadingImgUrl, setLoadingImgUrl] = useState(false);
  const [loadingImgUrlErr, setLoadingImgUrlErr] = useState(false);
  const url = props.clipInfo.url;
  const [player, setPlayer] = useState(undefined);

  const videoElementRef = useRef(null)

  // debug line: keep it
  // console.log(JSON.stringify(props.client.AllowedMethods(), null, 2));

  useEffect(() => {
    if (props.searchVersion === "v2" && props.searchAssets === true) {
      setLoadingImgUrl(true);
      setLoadingImgUrlErr(false);
      setImgUrl("");
      props.client
        .FileUrl({
          libraryId: props.clipInfo.qlib_id,
          versionHash: props.clipInfo.hash,
          filePath: `${props.clipInfo.prefix}`,
        })
        .then((url) => {
          setLoadingImgUrl(false);
          setLoadingImgUrlErr(false);
          console.log("Loading Img Url", url);
          setImgUrl(url);
        })
        .catch((err) => {
          setLoadingImgUrl(false);
          setLoadingImgUrlErr(true);
          console.log(err);
        });
    }
  }, [props.searchVersion, props.searchAssets]);

  useEffect(() => {
    if (props.searchVersion === "v2" && props.searchAssets === false) {
      setEmbedUrl("");
      // props.client
      //   .EmbedUrl({
      //     objectId: props.clipInfo.id,
      //     versionHash: props.clipInfo.hash,
      //     duration: 7 * 24 * 60 * 60 * 1000,
      //     options: {
      //       clipStart: props.clipInfo.start_time / 1000,
      //       clipEnd: props.clipInfo.end_time / 1000,
      //     },
      //   })
      getEmbedUrl({
        client: props.client,
        objectId: props.clipInfo.id,
        clipStart: props.clipInfo.start_time/1000,
        clipEnd: props.clipInfo.end_time/1000
      })
        .then((embUrl) => {
          setEmbedUrl(embUrl);
        })
        .catch((err) => {
          setEmbedUrl("Create Embed URL error");
          console.log(err);
        });
    }
  }, [props.searchVersion, props.searchAssets]);



  useEffect(() => {
    if (props.searchVersion === "v2" && props.searchAssets === false) {
      setDownloadUrl("");
      getDownloadUrlWithMaxResolution({
        client: props.client,
        objectId: props.clipInfo.id,
        libraryId: props.clipInfo.qlib_id, 
        clip_start: props.clipInfo.start_time/1000,
        clip_end: props.clipInfo.end_time/1000
      })
        .then((url) => {
          // console.log(url)
          setDownloadUrl(url);
        })
        .catch((err) => {
          setDownloadUrl("Create Download URL error");
          console.log(err);
        });
    }
  }, [props.searchVersion, props.searchAssets]);


  useEffect(() => {
    return () => {
      if (player) {
        player.Destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (props.searchVersion === "v1") {
      const _hasTags =
        Object.keys(props.clipInfo.sources[0].document.text).length > 0;
      if (_hasTags) {
        for (let src of props.clipInfo.sources) {
          const currdoc = src.document;
          const shotId = `${props.clipInfo.hash}_${currdoc.start_time}_${currdoc.end_time}`;
          shotsMemo.current[shotId] = null;
        }
      }
    } else {
      const _hasTags = Object.keys(props.clipInfo.sources[0].fields).length > 0;
      if (_hasTags) {
        for (let src of props.clipInfo.sources) {
          const currdoc = src.fields;
          const shotId = `${props.clipInfo.hash}_${currdoc.f_start_time}_${currdoc.f_end_time}`;
          shotsMemo.current[shotId] = null;
        }
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
        walletAddr: props.walletAddr,
        engagement: props.engagement.current,
        init: false,
      });
    }
  };

  const InitializeVideo = ({ element }) => {
    if (!element || player) {
      return;
    }
    const _player = new EluvioPlayer(element, {
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
    });
    // console.log("EluvioPlayer", _player);
    setPlayer(_player);
  };

  return (
    <div style={container}>
      <div style={videoContainer}>
        <div style={videoTitleContainer}>
          {"public" in props.clipInfo.meta
            ? props.clipInfo.meta.public.asset_metadata.title
            : props.clipInfo.prefix.split("/")[2]}
        </div>
        <div style={videoPlayerContainer}>
          {url !== null ? (
            props.searchVersion === "v2" && props.searchAssets === true ? (
              <div
                style={{
                  width: "auto",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loadingImgUrl ? (
                  "Loading Img Url"
                ) : loadingImgUrlErr ? (
                  "Loading Img Url Error"
                ) : (
                  <img
                    style={{
                      width: "auto",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    src={imgUrl}
                  ></img>
                )}
              </div>
            ) : (
              <div ref={(element) => InitializeVideo({ element })}></div>
            )
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
              Playout URL Error
            </div>
          )}
        </div>

        <div style={videoInfoContainer}>
          <InfoPad
            clipInfo={props.clipInfo}
            dbClient={props.dbClient}
            walletAddr={props.walletAddr}
            searchId={props.searchId}
            searchAssets={props.searchAssets}
            viewTime={viewTime.current}
            contents={props.contents}
            searchVersion={props.searchVersion}
            assetsUrl={imgUrl}
            clipEmbedUrl={embedUrl}
            clipDownloadUrl={downloadUrl}
          ></InfoPad>
        </div>
      </div>

      <QAPad
        clipInfo={props.clipInfo}
        searchVersion={props.searchVersion}
        searchId={props.searchId}
        searchAssets={props.searchAssets}
        shotsMemo={shotsMemo}
        dbClient={props.dbClient}
        videoElementRef={videoElementRef}
      ></QAPad>
    </div>
  );
};

export default ClipRes;
