import React, { useState } from "react";
const AuthTokenBox = (props) => {
  const [value, setValue] = useState("");
  return (
    <div>
      <text>AuthToken</text>
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

export default AuthTokenBox;
