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
  flexDirection: "column",
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
  paddingTop: 5,
  paddingBottom: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};

const selecter = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "90%",
  marginTop: 5,
  borderRadius: 5,
  // borderWidth: 1,
  paddingTop: 5,
  paddingBottom: 5,
  // borderColor: "grey",
  // borderStyle: "ridge",
};

const checker = {
  width: "15%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
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

const FuzzySearchBox = (props) => {
  const [text, setText] = useState("");
  const [isChecked_stt, setIsChecked_stt] = useState(false);
  const [isChecked_od, setIsChecked_od] = useState(false);
  const [isChecked_celeb, setIsChecked_celeb] = useState(false);
  const [isChecked_title, setIsChecked_title] = useState(false);
  const textBox = (
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
  const fieldBox = (
    <div style={selecter}>
      <div style={checker}>
        <input
          style={{ marginRight: 5 }}
          type="checkbox"
          checked={isChecked_stt}
          onChange={() => setIsChecked_stt((prev) => !prev)}
        />
        <span>speech_to_text</span>
      </div>

      <div style={checker}>
        <input
          style={{ marginRight: 5 }}
          type="checkbox"
          checked={isChecked_od}
          onChange={() => setIsChecked_od((prev) => !prev)}
        />
        <span>object_detection</span>
      </div>

      <div style={checker}>
        <input
          style={{ marginRight: 5 }}
          type="checkbox"
          checked={isChecked_celeb}
          onChange={() => setIsChecked_celeb((prev) => !prev)}
        />
        <span>celebrity</span>
      </div>

      <div style={checker}>
        <input
          style={{ marginRight: 5 }}
          type="checkbox"
          checked={isChecked_title}
          onChange={() => setIsChecked_title((prev) => !prev)}
        />
        <span>title</span>
      </div>
    </div>
  );
  const control = (
    <button
      type="button"
      style={{ ...button, backgroundColor: "#3b87eb" }}
      onClick={() => {
        if (text !== "") {
          const fields = [];
          if (isChecked_stt) {
            fields.push("f_speech_to_text");
          }
          if (isChecked_od) {
            fields.push("f_object");
          }
          if (isChecked_celeb) {
            fields.push("f_celebrity");
          }
          if (isChecked_title) {
            fields.push("f_display_title");
          }
          props.handleSubmitClick({ fields: fields, text: text });
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
      <div style={left}>{props.text}</div>
      <div style={middle}>
        {textBox}
        {props.display ? ` Field ` : ""}
        {fieldBox}
      </div>

      <div style={right}>{control}</div>
    </div>
  );
};

export default FuzzySearchBox;
