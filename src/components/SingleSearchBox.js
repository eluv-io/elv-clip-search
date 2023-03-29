import React from "react";

const body = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 5,
};
const box = {
  width: "60%",
  height: "90%",
  paddingLeft: 20,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};

const selecter = {
  width: "10%",
  height: "90%",
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "grey",
  borderStyle: "ridge",
};

const button = {
  width: "5%",
  border: "None",
  borderRadius: 10,
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
  return (
    <div style={body}>
      <div style={{ width: "10%" }}>{props.text}</div>
      <input
        name="textInputer"
        required="required"
        type="text"
        style={box}
        id="ObjId"
        defaultValue={props.searchTextValue}
        onChange={(event) => {
          console.log(event.target.value);
          props.searchTextHandler(event.target.value);
        }}
      />
      <select
        name="fieldSelecter"
        onChange={(event) => {
          console.log(event.target.value);
          props.searchFieldHandler(event.target.value);
        }}
        style={selecter}
      >
        {options.map((key) => {
          return <option value={key}>{key}</option>;
        })}
      </select>
      <button
        type="button"
        style={button}
        onClick={() => props.handleClearClick()}
        disabled={props.disabled}
      >
        ❌
      </button>
      {/* <button
        type="button"
        style={button}
        onClick={() => props.handleSubmitClick()}
        disabled={props.disabled}
      >
        ✔️
      </button> */}
    </div>
  );
};

export default SingleSearchBox;
