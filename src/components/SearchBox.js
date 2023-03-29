import React, { useState } from "react";
import SingleSearchBox from "./SingleSearchBox";
const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};
const body = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};

const controlButton = {
  width: "25%",
  border: "None",
  borderRadius: 10,
  padding: 5,
};

const SearchBox = (props) => {
  const [terms, setTerms] = useState([{ field: "all", text: "" }]);

  return (
    <div style={container}>
      {terms.map((element, index) => {
        return (
          <SingleSearchBox
            text="Search term"
            searchTextValue={element.text}
            searchFieldValue={element.field}
            handleClearClick={() => {
              if (terms.length > 1) {
                console.log(index);
                const firstHalf = terms.slice(0, index);
                const secondHalf = terms.slice(index + 1, terms.length);
                console.log(firstHalf);
                console.log(secondHalf);
                const newRes = firstHalf.concat(secondHalf);
                console.log(newRes);
                setTerms(newRes);
              }
            }}
            searchTextHandler={(val) => {
              terms[index].text = val;
              console.log(terms);
              setTerms(terms);
            }}
            searchFieldHandler={(val) => {
              terms[index].field = val;
              console.log(terms);
              setTerms(terms);
            }}
          ></SingleSearchBox>
        );
      })}
      <div style={{ ...body, justifyContent: "space-around", marginTop: 10 }}>
        <button
          type="button"
          style={{ ...controlButton, backgroundColor: "#e2edf6" }}
          onClick={() => {
            setTerms(terms.concat([{ field: "all", text: "" }]));
          }}
          disabled={props.disabled}
        >
          Add another term
        </button>
        <button
          type="button"
          style={{ ...controlButton, backgroundColor: "#f4e5e6" }}
          onClick={() => setTerms([{ field: "all", text: "" }])}
          disabled={props.disabled}
        >
          Clear all search term
        </button>
        <button
          type="button"
          style={{ ...controlButton, backgroundColor: "#e0eae0" }}
          onClick={() => {}}
          disabled={props.disabled}
        >
          Submit all search term
        </button>
      </div>
    </div>
  );
};

export default SearchBox;
