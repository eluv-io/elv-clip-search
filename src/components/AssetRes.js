import QAPad from "./QAPad";
import InfoPad from "./InfoPad";
import React, { useEffect, useRef, useState } from "react";
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

const AssetRes = (props) => {
  const viewTime = useRef(1);
  const shotsMemo = useRef({});
  const [imgUrl, setImgUrl] = useState("");
  const [loadingImgUrl, setLoadingImgUrl] = useState(false);
  const [loadingImgUrlErr, setLoadingImgUrlErr] = useState(false);
  const url = props.clipInfo.url;
  // debug line: keep it
  // console.log(JSON.stringify(props.client.AllowedMethods(), null, 2));

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    shotsMemo.current[`${props.clipInfo.hash}${props.clipInfo.prefix}`] = null;
  }, []);

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
          ></InfoPad>
        </div>
      </div>

      <QAPad
        clipInfo={props.clipInfo}
        searchId={props.searchId}
        searchAssets={props.searchAssets}
        searchVersion={props.searchVersion}
        shotsMemo={shotsMemo}
        dbClient={props.dbClient}
      ></QAPad>
    </div>
  );
};

export default AssetRes;
