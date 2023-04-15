import React, { useState } from "react";
const body = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};
const left = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "10%",
  height: "100%",
};
const right = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "5%",
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
  width: "100%",
  height: "90%",
  paddingLeft: 20,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};
const button = {
  width: "100%",
  border: "None",
  borderRadius: 5,
  padding: 5,
  backgroundColor: "#3b87eb",
  color: "white",
};
const InputBox = (props) => {
  const [value, setValue] = useState("");
  return (
    <div style={body}>
      <div style={left}>{props.text}</div>
      <div style={middle}>
        <input
          required="required"
          type="text"
          style={box}
          id="ObjId"
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div style={right}>
        <button
          type="button"
          style={button}
          onClick={() => props.handleSubmitClick(value)}
          disabled={props.disabled}
        >
          ADD
        </button>
      </div>
    </div>
  );
};

export default InputBox;
