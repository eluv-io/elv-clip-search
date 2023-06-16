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
  width: "13%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
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
  const options = props.filteredSearchFields;
  const [checkedState, setCheckedState] = useState(
    // new Array(props.filteredSearchFields.length).fill(false)
    props.filteredSearchFields.map((item) => {
      return item !== "f_characters";
    })
  );
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
      {options.map((item, index) => {
        return (
          <div style={checker} key={item}>
            <input
              style={{ marginRight: 5 }}
              type="checkbox"
              checked={checkedState[index]}
              onChange={() => {
                const updatedCheckedState = checkedState.map((status, _index) =>
                  index === _index ? !status : status
                );
                setCheckedState(updatedCheckedState);
              }}
            />
            <span style={{ fontSize: 13 }}>{item.slice(2)}</span>
          </div>
        );
      })}
    </div>
  );
  const control = (
    <button
      type="button"
      style={{ ...button, backgroundColor: "#3b87eb" }}
      onClick={() => {
        if (text !== "") {
          const fields = options.filter((item, index) => {
            return checkedState[index];
          });
          props.handleSubmitClick({ fields: fields, text: `(${text})` });
        } else {
          props.handleSubmitClick({ fields: [], text: "" });
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
