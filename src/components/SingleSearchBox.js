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
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};
const boxInfo = {
  paddingLeft: 20,
  width: "75%",
  height: "90%",
};

const selecter = {
  width: "15%",
  height: "90%",
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};

const selecterInfo = {
  width: "15%",
  height: "90%",
  paddingLeft: 5,
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
};

const SingleSearchBox = (props) => {
  const options = [
    "all",
    "f_logo",
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
        return <option value={key}>{key}</option>;
      })}
    </select>
  );
  const control = props.display ? (
    <button
      type="button"
      style={{ ...button, backgroundColor: "#f4e4e5" }}
      onClick={() => {
        props.removeHandler();
        props.statusHandler();
      }}
      disabled={props.disabled}
    >
      ✖️
    </button>
  ) : (
    <button
      type="button"
      style={{ ...button, backgroundColor: "#dbe4ed" }}
      onClick={() => {
        if (text !== "") {
          props.addHandler({ field: field, text: text });
          props.statusHandler();
          setField("all");
          setText("");
        }
      }}
      disabled={props.disabled}
    >
      ✔️
    </button>
  );
  return (
    <div style={body}>
      <div style={left}>
        {props.display ? `added Terms ${props.index}` : props.text}
      </div>
      <div style={middle}>
        {textBox}
        {fieldBox}
      </div>
      <div style={right}>{control}</div>
    </div>
  );
};

export default SingleSearchBox;