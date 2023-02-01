import React, { useState } from "react";
const SearchBox = (props) => {
  const [value, setValue] = useState("");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <text>Search phrase</text>
      <input
        required="required"
        type="text"
        className="form-control mr-3"
        id="search"
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => props.handleSubmitClick(value)}
      >
        Submit
      </button>
    </div>
  );
};

export default SearchBox;
