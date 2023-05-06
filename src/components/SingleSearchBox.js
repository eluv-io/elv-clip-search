import React, { useState } from "react";

const body = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 5,
};

const left = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "10%",
  height: "100%",
};

const middle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "80%",
  height: "100%",
};
const box = {
  width: "80%",
  height: "90%",
  paddingLeft: 20,
  borderRadius: 5,
  paddingTop: 5,
  paddingBottom: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};
const boxInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 20,
  paddingTop: 5,
  paddingBottom: 5,
  width: "80%",
  height: "100%",
  borderRadius: 5,
  backgroundColor: "whitesmoke",
};

const selecter = {
  width: "15%",
  height: "90%",
  borderRadius: 5,
  borderWidth: 1,
  paddingTop: 5,
  paddingBottom: 5,
  borderColor: "grey",
  borderStyle: "ridge",
};

const selecterInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "15%",
  height: "90%",
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 5,
  borderRadius: 5,
  backgroundColor: "whitesmoke",
};

const right = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "5%",
  height: "100%",
};

const button = {
  width: "100%",
  border: "None",
  borderRadius: 5,
  padding: 5,
  color: "white",
};

const button_bold = {
  width: "100%",
  border: "None",
  borderRadius: 5,
  padding: 5,
  color: "white",
  fontWeight: "bold",
};

const SingleSearchBox = (props) => {
  const options = [
    "all",
    "f_logo",
    "f_object",
    "f_segment",
    "f_speech_to_text",
    "f_celebrity",
    "f_display_title",
  ];
  const [text, setText] = useState("");
  const [field, setField] = useState("all");

  const textBox = props.display ? (
    <div style={boxInfo}>{props.searchText}</div>
  ) : (
    <input
      id="textInputer"
      required="required"
      type="text"
      style={box}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
      }}
    />
  );
  const fieldBox = props.display ? (
    <div style={selecterInfo}>{props.searchField}</div>
  ) : (
    <select
      id="fieldSelecter"
      onChange={(event) => {
        setField(event.target.value);
      }}
      value={field}
      style={selecter}
    >
      {options.map((key) => {
        return (
          <option key={`option-${key}`} value={key}>
            {key}
          </option>
        );
      })}
    </select>
  );
  const control = props.display ? (
    <button
      type="button"
      style={{ ...button_bold, backgroundColor: "#d34848" }}
      onClick={() => {
        props.removeHandler();
        props.statusHandler();
      }}
      disabled={props.disabled}
    >
      X
    </button>
  ) : (
    <button
      type="button"
      style={{ ...button, backgroundColor: "#3b87eb" }}
      onClick={() => {
        if (text !== "") {
          props.addHandler({ field: field, text: text });
          setField("all");
          setText("");
        }
        props.statusHandler();
      }}
      disabled={props.disabled}
    >
      ADD
    </button>
  );
  return (
    <div style={body}>
      <div style={left}>
        {props.display ? `Keyword ${props.index + 1}` : props.text}
      </div>
      <div style={middle}>
        {textBox}
        {props.display ? ` Field ` : ""}
        {fieldBox}
      </div>

      <div style={right}>{control}</div>
    </div>
  );
};

export default SingleSearchBox;
