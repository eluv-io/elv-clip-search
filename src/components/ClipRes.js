import React, { useState, useRef } from "react";
import ReactHlsPlayer from "react-hls-player";
const body = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "whitesmoke",
  borderWidth: 2,
  borderColor: "grey",
  border: "solid",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10,
  borderRadius: 10,
  width: "96%",
};

const info = {
  display: " flex",
  flexDirection: "column",
  width: "100%",
  height: "20%",
  margin: "2%",
  alignItems: "center",
  justifyContent: "center",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "95%",
  height: "8%",
  marginTop: "0.5%",
};

const longInfo = {
  width: "95%",
  height: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const videoPlayer = {
  width: "90%",
  height: "70%",
  marginTop: "2%",
  flexDirection: "colomn",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const buttonInfo = {
  display: "flex",
  flexDirection: "row"
}

const feedback = {
  display: "flex",
  flexDirection: "column"
}


const ClipRes = (props) => {

  const [like, setLike] = useState(false);
  const [dislike, setdisLike] = useState(false);

  const resetButton = () => {
    setLike(false);
    setdisLike(false);
    document.getElementById("likebutton").style.backgroundColor="";
    document.getElementById("dislikebutton").style.backgroundColor="";
  }
  const thumbsDownClicked = () => {
    console.log('Thumbs down clicked');
    resetButton();
    if (dislike === false) {
      setdisLike(true);
      document.getElementById("dislikebutton").style.backgroundColor="#911";
    }
  }
  
  const thumbsUpClicked = () => {
    console.log('Thumbs up clicked');
    resetButton();
    if (like === false) {
      setLike(true);
      document.getElementById("likebutton").style.backgroundColor="#34568B";
    }
  }

  const changeRating = (num) => {
    
  }

  const url = `${props.clipInfo.url}&resolve=false&clip_start=${
    props.clipInfo.start_time / 1000
  }&clip_end=${props.clipInfo.end_time / 1000}&ignore_trimming=true`;
  return (
    <div style={body}>
      <div style={videoPlayer}>
        <ReactHlsPlayer
          src={url}
          width="100%"
          height="auto"
          autoPlay={false}
          controls={true}
          hlsConfig={{
            capLevelToPlayerSize: true,
            maxBufferLength: 1,
          }}
        ></ReactHlsPlayer>
      </div>
      <div style={info}>
        {/* <div style={shortInfo}>
          <div>title: </div>
          <div>{props.clipInfo.meta.public.asset_metadata.title}</div>
        </div> */}
        <div style={shortInfo}>
          <div>library id: </div>
          <div>{props.clipInfo.qlib_id}</div>
        </div>
        <div style={shortInfo}>
          <div>content id: </div>
          <div>{props.clipInfo.id}</div>
        </div>
        <div style={shortInfo}>
          <div>start_time: </div>
          <div>{props.clipInfo.start}</div>
        </div>
        <div style={shortInfo}>
          <div>end_time: </div>
          <div>{props.clipInfo.end}</div>
        </div>
        <div style={longInfo}>
          <div>playout url</div>
          <textarea
            name="playout url"
            value={url}
            style={{
              height: "100%",
              width: "100%",
              padding: 5,
              borderStyle: "None",
              borderRadius: 10,
            }}
            readOnly
          ></textarea>
        </div>
        <div style={feedback}>
          {/* <div>rate me</div> */}
          <br></br>

          {/* thums up and down */}
          <div style={buttonInfo}>
            <button id='likebutton' onClick={thumbsUpClicked}>👍</button>
            <button id='dislikebutton' onClick={thumbsDownClicked}>👎</button>
          </div>

          <p></p>
          {/* rating system */}
          <div class="rating" style={{display: "flex", flexDirection: "row"}}>
            <div class="star1" style={{display: "flex", flexDirection: "column"}}>
              <input type="radio" id="star5" name="rating" value="5"></input>
              <label for="star1">1</label>
            </div>
            <div class="star2" style={{display: "flex", flexDirection: "column"}}>
              <input type="radio" id="star4" name="rating" value="4"></input>
              <label for="star2">2</label>
            </div>
            <div class="star3" style={{display: "flex", flexDirection: "column"}}>
              <input type="radio" id="star3" name="rating" value="3"></input>
              <label for="star3">3</label>
            </div>
            <div class="star4" style={{display: "flex", flexDirection: "column"}}>
              <input type="radio" id="star2" name="rating" value="2"></input>
              <label for="star4">4</label>
            </div>
            <div class="star5" style={{display: "flex", flexDirection: "column"}}>
              <input type="radio" id="star1" name="rating" value="1"></input>
              <label for="star5">5</label>
            </div>
          </div>

          {/* <div class="rating">
              <i class="rating__star far fa-star"></i>
              <i class="rating__star far fa-star"></i>
              <i class="rating__star far fa-star"></i>
              <i class="rating__star far fa-star"></i>
              <i class="rating__star far fa-star"></i>

              <script>
                const ratingStars = [...document.getElementsByClassName("rating__star")];

                function executeRating(stars) {
                  const starClassActive = "rating__star fas fa-star";
                  const starClassInactive = "rating__star far fa-star";
                  const starsLength = stars.length;
                  let i;
                  stars.map((star) => {
                    star.onclick = () => {
                      i = stars.indexOf(star);

                      if (star.className===starClassInactive) {
                        for (i; i >= 0; --i) stars[i].className = starClassActive;
                      } else {
                        for (i; i < starsLength; ++i) stars[i].className = starClassInactive;
                      }
                    }
                  })
                }
                executeRating(ratingStars);
              </script>
          </div> */}


        </div>
      </div>

      <div>
        {like ? (
          <div id='liketxt' style={{display: 'flex'}}>Thanks for your feedback</div>
        ) : dislike ? (
          <div style = {{flexDirection: "column"}}>
            {/* <div id='disliketxt' style={{display: 'flex'}}>We value your feedback:</div> */}
            <select id="choices">
              <option value="1">Movie scene matched to speech text</option>
              <option value="2">Speech text matched to movie scene</option>
              <option value="3">Object misrecognition</option>
              <option value="4">Typos recognized as actual words</option>
            </select>
            <div style = {{flexDirection: "column"}}>
              <textarea id="freeform" name="freeform" rows="4" cols="30">Other reasons...</textarea>
            </div>
          </div>
        ): null}
      </div>
    </div>
  );
};

export default ClipRes;
