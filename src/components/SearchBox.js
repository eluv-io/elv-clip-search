import React, { useState } from "react";
const SearchBox = (props) => {
  const [value, setValue] = useState("");
  return (
    <div>
      <text>Input search phrase</text>
      <input
        required="required"
        type="text"
        class="form-control mr-3"
        id="search"
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="button"
        class="btn btn-primary"
        onClick={() => props.handleSubmitClick(value)}
      >
        Submit
      </button>
    </div>
  );
};

export default SearchBox;
