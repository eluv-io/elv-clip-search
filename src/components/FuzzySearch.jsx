import React, { useState } from "react";
import {CloseButton, Flex, Text, TextInput} from "@mantine/core";

const selecter = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "90%",
  marginTop: 5,
  borderRadius: 5,
  paddingTop: 5,
  paddingBottom: 5,
};

const checker = {
  width: "13%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
};

const button = {
  border: "None",
  borderRadius: 5,
  padding: "5px 25px",
  color: "white",
};

const FuzzySearchBox = (props) => {
  const [text, setText] = useState("");
  const options = props.filteredSearchFields;
  const [checkedState, setCheckedState] = useState(
    new Array(props.filteredSearchFields.length).fill(true)
  );
  const textBox = (
    <TextInput
      id="textInputer"
      required={true}
      w="100%"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          if (text.trim() !== "") {
            const fields = options.filter((item, index) => {
              return checkedState[index];
            });
            props.handleSubmitClick({
              fields: fields,
              text: text.trim(),
            });
          } else {
            props.handleSubmitClick({ fields: [], text: "" });
          }

          props.statusHandler();
        }
      }}
      rightSection={
        text !== "" ? (
          <CloseButton
            size="sm"
            onMouseDown={event => event.preventDefault()}
            onClick={() => setText("")}
            aria-label="Clear Value"
          />
        ) : null
      }
      rightSectionPointerEvents={text === "" ? "none" : "all"}
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
              disabled={props.disabled}
              onChange={() => {
                const updatedCheckedState = checkedState.map((status, _index) =>
                  index === _index ? !status : status
                );
                setCheckedState(updatedCheckedState);
                if (text.trim() !== "") {
                  const fields = options.filter((item, index) => {
                    return updatedCheckedState[index];
                  });
                  props.handleSubmitClick({
                    fields: fields,
                    text: text.trim(),
                  });
                }
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
        if (text.trim() !== "") {
          const fields = options.filter((item, index) => {
            return checkedState[index];
          });
          props.handleSubmitClick({ fields: fields, text: text.trim() });
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
    <Flex
      w="100%"
      align="center"
      gap={16}
      mt={16}
      p="0 12"
    >
      <Text style={{textWrap: "nowrap", display: "flex", flex: "0 0 170px"}}>Search Phrase</Text>
      <Flex
        direction="column"
        align="center"
        w="100%"
        justify="space-between"
      >
        {textBox}
        {props.display ? ` Field ` : ""}
        {/* {fieldBox} */}
      </Flex>

      {control}
    </Flex>
  );
};

export default FuzzySearchBox;
