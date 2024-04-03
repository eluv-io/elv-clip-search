import React, { useEffect, useState, useRef} from "react";
import userLogo from "../logo192.png"
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
  height: "10%",
  width: "100%",
}

const messageBox = {
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "70%",
  width: "100%",
  border: "solid",
  padding: 15,
  borderWidth: 1,
  borderRadius: 5,
}

const messages = {
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
  height: "100%",
  padding: 10,
  overflow: "scroll",
  backgroundColor: "white",
}

const inputBox = {
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "10%",
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
 
const MessageBox = ({history}) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [history]);

  console.log(messagesEndRef.current)
  return (
    <div 
      style={{
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: 10,
        overflow: "scroll",
      }} 
      ref={messagesEndRef}
    >
      {
        history.map((item) => {
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
    </div>
  )
}

const ChatBox = (props) => {
  const [inputValue, setInputValue] = useState(""); 
  const [inputHistory, setInputHistory] = useState([])
  return (
    <div style={body}>
      {/* title */}
      <div style={title}>
          Search Assistant
      </div>

      {/* chat history */}
      <div style={messageBox}>
        <MessageBox history={inputHistory} />
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
          onClick={() => {
            if (inputValue.trim() !== "") {
              const _inputHistory = inputHistory;
              setInputValue("")
              _inputHistory.push([0, inputValue])
              // get the chatbot response 
              _inputHistory.push([1, "DUMMY RESPONCE"])
              setInputHistory(_inputHistory)
              
              
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