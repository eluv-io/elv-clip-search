import React, { useState } from "react";
import Feedback from "./Feedback";
import TagsPad from "./TagsPad";

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
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: 460,
  marginBottom: 20,
  backgroundColor: "white",
};

const feedbackContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: 220,
};

const ctrContainer = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "8%",
  height: "100%",
};

const QAPad = (props) => {
  const [hidden, setHidden] = useState(true);
  const tags = {
    "Celebrity Detection": [],
    "Landmark Recognition": [],
    "Logo Detection": [],
    "Object Detection": [],
    "Optical Character Recognition": [],
    "Segment Labels": [],
    "Speech to Text": [],
  };
  return !hidden ? (
    <div style={container}>
      <div style={QAContainer}>
        <div style={tagsContainer}>
          <TagsPad 
            clipInfo={props.clipInfo}
            db={props.db}
            searchID={props.searchID}
            tags={tags}
            ></TagsPad>
        </div>

        <div style={feedbackContainer}>
          <Feedback
            db={props.db}
            clientadd={props.clientadd}
            searchID={props.searchID}
            viewTime={props.viewTime}
            clipInfo={props.clipInfo}
            contents={props.contents}
            tags={tags}
          ></Feedback>
        </div>
      </div>
      <div style={ctrContainer}>
        <button
          style={{
            border: "none",
            width: "100%",
            height: "10%",
            backgroundColor: "lightgray",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
          onClick={() => {
            setHidden(true);
          }}
        >
          ◀️
        </button>
      </div>
    </div>
  ) : (
    <div style={{ ...ctrContainer, width: "2%" }}>
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
