import React, { useState } from "react";
const body = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};
const box = {
  width: "70%",
  height: "90%",
  paddingLeft: 20,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};
const InputBox = (props) => {
  const [value, setValue] = useState("");
  return (
    <div style={body}>
      <div style={{ width: "10%" }}>{props.text}</div>
      <input
        required="required"
        type="text"
        style={box}
        id="ObjId"
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => props.handleSubmitClick(value)}
        disabled={props.disabled}
      >
        Submit
      </button>
    </div>
  );
};

export default InputBox;
