import React, { useEffect, useState, useRef} from "react";
import { CgSpinnerTwo } from "react-icons/cg";

import userLogo from "../user.png"
import elvLogo from "../elv.png"
const body={
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  height: "100%",
  width: "90%"
}

const title = {
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "5%",
  width: "100%",
}

const messageBox = {
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "80%",
  width: "100%",
  border: "solid",
  padding: 15,
  borderWidth: 1,
  borderRadius: 5,
  overflow: "scroll",
}

const inputBox = {
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "7%",
  width: "90%",
}

const Message = ({item}) => {
  return (
    <div style={{
      flexDirection: "column",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    }}>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100%",
          width: "100%",
        }} 
      >
        <img 
          src={item[0] == 0 ? userLogo : elvLogo} 
          width="30px" height="30px"
        ></img>
        <div style={{
          marginLeft: 10,
          fontWeight: "bold"
        }}>
          {item[0] == 0 ? "You" : "Eluvio virtual assistant"} 
        </div>
        
      </div>
      <div style={{
        marginLeft: 50,
      }}>
        {item[1]}
      </div>
    </div>
  )
}
 

const ChatBox = (props) => {
  const [inputValue, setInputValue] = useState(""); 
  const [inputHistory, setInputHistory] = useState([])
  const [scroll, setScroll] = useState(true)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    console.log("scrolling to bottom")
    scrollToBottom()
  }, [scroll]);


  // handling the request\
  // dummy waiting req
  const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

  const handleRequest = async ({query}) => {
    setLoading(true)
    await delay(1500)
    setLoading(false)
    // get the chatbot response 
    const _inputHistory = inputHistory
    _inputHistory.push([1, "DUMMY RESPONCE"])
    setInputHistory(_inputHistory)
    setScroll((v) => !v)
  }

  return (
    <div style={body}>
      {/* title */}
      <div style={title}>
          Search Assistant
      </div>

      {/* chat history */}
      <div style={messageBox}>
        {
          inputHistory.map((item) => {
            return (
              <div style={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 60,
                minHeight: 60,
                maxHeight: 60,
                width: "90%",
                padding: 10,
                margin: 10,
                borderRadius: 10,
              }}>
                <Message item={item}></Message>
              </div>
              
            )
          })
        }
       {loading && "loading"}
        <div ref={messagesEndRef}></div>
      </div>

      {/* input box */}
      <div style={inputBox}>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "6%",
            height: "90%",
            backgroundColor: "#3b87eb",
            color: "white",
            borderRadius: 5,
            cursor: "pointer"
          }}
          onClick={() => {
            setInputValue("")
            setInputHistory([])
          }}
        >
          X
        </div>
        <input
          style={{
            width: "80%",
            height: "90%",
            padding: 10,
            borderRadius: 5,
            borderWidth: 1,
          }}
          id="ObjId"
          onChange={(event) => setInputValue(event.target.value)}
          value={inputValue}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // if (inputValue.trim() !== "") {
              //   const _inputHistory = inputHistory;
              //   _inputHistory.push(inputValue)
              //   // get the chatbot response 
              //   _inputHistory.push("DUMMY RESPONSCE")
              //   setInputHistory(_inputHistory)
              //   setInputValue("")
              // }
            }
          }}
        ></input>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "8%",
            height: "90%",
            backgroundColor: "#3b87eb",
            color: "white",
            borderRadius: 5,
            cursor: "pointer"
          }}
          onClick={async () => {
            if (inputValue.trim() !== "") {
              const _inputHistory = inputHistory;
              setInputValue("")
              _inputHistory.push([0, inputValue])
              setInputHistory(_inputHistory)
              setScroll((item) => !item)
              await handleRequest({query: inputValue.trim()})
            }
          }}
        >
          send
        </div>
      </div>
    </div>
  )
}

export default ChatBox