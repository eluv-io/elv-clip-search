import Feedback from "./Feedback";
import React, { useState } from "react";
const videoInfo = {
  width: "100%",
  height: "83%",
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
  height: "12%",
};

const InfoPad = (props) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "15%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            height: "100%",
            width: "10%",
            borderBottom: showDetails ? "solid" : "none",
          }}
          id={`detail_select_${props.clipInfo.start}`}
          onMouseEnter={() => {
            if (!showDetails) {
              document.getElementById(
                `detail_select_${props.clipInfo.start}`
              ).style.borderBottom = "dashed";
            }
          }}
          onMouseOut={() => {
            if (!showDetails) {
              document.getElementById(
                `detail_select_${props.clipInfo.start}`
              ).style.borderBottom = "none";
            }
          }}
          onClick={() => {
            if (!showDetails) {
              setShowDetails(true);
            }
          }}
        >
          Details
        </button>
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            height: "100%",
            width: "10%",
            borderBottom: showDetails ? "none" : "solid",
          }}
          id={`review_select_${props.clipInfo.start}`}
          onMouseEnter={() => {
            if (showDetails) {
              document.getElementById(
                `review_select_${props.clipInfo.start}`
              ).style.borderBottom = "dashed";
            }
          }}
          onMouseOut={() => {
            if (showDetails) {
              document.getElementById(
                `review_select_${props.clipInfo.start}`
              ).style.borderBottom = "none";
            }
          }}
          onClick={() => {
            if (showDetails) {
              setShowDetails(false);
            }
          }}
        >
          Review
        </button>
      </div>
      {showDetails ? (
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

          <div style={shortInfo}>
            <div>source count: </div>
            <div>{props.clipInfo.source_count}</div>
          </div>

          {props.searchVersion === "v2" ? (
            <div style={shortInfo}>
              <div>BM25 rank: </div>
              <div>{props.clipInfo.rank}</div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "40%",
            }}
          >
            <textarea
              style={{
                height: "100%",
                width: "100%",
                padding: 5,
                borderRadius: 5,
                backgroundColor: "transparent",
              }}
              readOnly
            >
              {props.clipInfo.url}
            </textarea>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "80%",
          }}
        >
          <Feedback
            db={props.db}
            clientadd={props.clientadd}
            searchID={props.searchID}
            viewTime={props.viewTime}
            clipInfo={props.clipInfo}
            contents={props.contents}
          ></Feedback>
        </div>
      )}
    </div>
  );
};

export default InfoPad;
