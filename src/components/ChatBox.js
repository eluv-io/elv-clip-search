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


  // handling the request

  // dummy waiting req
  const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

  // 1. send to LLM to rewrite the query
  // 2. use function provide by parent compoennt to get search res
  const handleRequest = async () => {
    // make sure we disabled the buttons in this component 
    setLoading(true)

    // reset the buttons in parent compoennt
    props.statusHandler()

    // mock : using LLM to rewrite the query
    await delay(1000)
    const query = inputValue.trim()

    // send request 
    await props.searchHandler(inputValue.trim())

    // got the res, loading = False
    setLoading(false)

    // set the chatbot response 
    const _inputHistory = inputHistory
    _inputHistory.push([1, "Below are clips that may match your search"])
    setInputHistory(_inputHistory)

    // scroll to bottom
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
        <button
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "6%",
            height: "90%",
            backgroundColor: loading ? "gray" : "#3b87eb",
            color: "white",
            borderRadius: 5,
            border: "none"
          }}
          onClick={() => {
            setInputValue("")
            setInputHistory([])
          }}
          disabled={loading}
        >
          X
        </button>
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
            if (event.key === "Enter") {}
          }}
        ></input>
        <button
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "8%",
            height: "90%",
            backgroundColor: loading ? "gray" : "#3b87eb",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
          disabled={loading}
          
          onClick={async () => {
            if (inputValue.trim() !== "") {
              const _inputHistory = inputHistory;
              setInputValue("")
              _inputHistory.push([0, inputValue])
              setInputHistory(_inputHistory)
              setScroll((item) => !item)
              await handleRequest()
            }
          }}
        >
          send
        </button>
      </div>
    </div>
  )
}

export default ChatBox