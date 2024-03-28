import React, { useState } from "react";
import TagsPad from "./TagsPad";
import { BsXLg } from "react-icons/bs";

const container = {
  width: "30%",
  height: "95%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "gray",
  border: "solid",
  borderLeft: "none",
  borderRadius: 10,
  paddingLeft: 10,
};

const QAContainer = {
  width: "90%",
  height: "97%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
};

const tagsContainer = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  height: 750,
  marginBottom: 20,
  backgroundColor: "transparent",
};

const ctrContainer = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "8%",
  height: "100%",
};

const QAPad = (props) => {
  const [hidden, setHidden] = useState(true);
  const [showTags, setShowTags] = useState(true)
  return !hidden ? (
    <div style={container}>
      <div style={QAContainer}>
        <div
          style={{
            width: "90%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            onClick={() => {setShowTags(true)}}
            style={{
              cursor: "pointer",
              paddingLeft: 10,
              paddingRight: 10,
              marginRight: 10,
              marginLeft: 10,
              borderRadius: 5,
              backgroundColor: showTags ? "lightgray" : "transparent"
            }}
          >
            Tags
          </div>
          <div
            onClick={() => {setShowTags(false)}}
            style={{
              cursor: "pointer",
              paddingLeft: 10,
              paddingRight: 10,
              marginRight: 10,
              marginLeft: 10,
              borderRadius: 5,
              backgroundColor: showTags ? "transparent" : "lightgray"
            }}
          >
            Summary
          </div>
        </div>
        <div style={tagsContainer}>
          <TagsPad
            clipInfo={props.clipInfo}
            searchId={props.searchId}
            searchVersion={props.searchVersion}
            searchAssets={props.searchAssets}
            shotsMemo={props.shotsMemo}
            dbClient={props.dbClient}
          ></TagsPad>
        </div>
      </div>
      <div style={ctrContainer}>
        <button
          style={{
            border: "none",
            width: "100%",
            backgroundColor: "transparent",
          }}
          onClick={() => {
            setHidden(true);
          }}
        >
          <BsXLg />
        </button>
      </div>
    </div>
  ) : (
    <div style={{ ...ctrContainer, width: "2%", justifyContent: "center"}}>
      <button
        style={{
          border: "none",
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          width: "100%",
          height: "10%",
          backgroundColor: "lightgray",
        }}
        onClick={() => {
          setHidden(false);
        }}

      >
        ▶️
      </button>
    </div>
  );
};

export default QAPad;
