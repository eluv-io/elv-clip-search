import React, { useState } from "react";
import SingleSearchBox from "./SingleSearchBox";
const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};

const SearchBox = (props) => {
  const [terms, setTerms] = useState([]);
  // TODO change for fuzzy search
  const makeString = (terms) => {
    const res = [];
    for (let item of terms) {
      if (item.field === "all") {
        res.push(`("${item.text}")`);
      } else {
        res.push(`(${item.field}:"${item.text}")`);
      }
    }
    if (res.length > 0) {
      const resStr = `${res.join("AND")}`;
      return resStr;
    } else {
      return "";
    }
  };
  return (
    <div style={container}>
      <SingleSearchBox
        text="Add Keywords"
        disabled={props.disabled}
        addHandler={(newElement) => {
          const newTerms = terms.concat(newElement);
          setTerms(newTerms);
          const res = makeString(newTerms);
          props.handleSubmitClick(res);
        }}
        statusHandler={props.statusHandler}
      ></SingleSearchBox>
      {terms.map((element, index) => {
        return (
          <SingleSearchBox
            index={index}
            display={true}
            searchText={element.text}
            searchField={element.field}
            statusHandler={props.statusHandler}
            disabled={props.disabled}
            key={index.toString()}
            removeHandler={() => {
              if (terms.length >= 1) {
                const firstHalf = terms.slice(0, index);
                const secondHalf = terms.slice(index + 1, terms.length);
                const newTerms = firstHalf.concat(secondHalf);
                setTerms(newTerms);
                const res = makeString(newTerms);
                props.handleSubmitClick(res);
              }
            }}
          ></SingleSearchBox>
        );
      })}
    </div>
  );
};

export default SearchBox;
