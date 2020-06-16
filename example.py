import streamlit as st
from webcam import webcam

st.title("Webcam capture component")

st.write("""
- Accesses the user's webcam and displays the video feed in the browser.
- Click the "Capture Frame" button to grab the current video frame and
return it to Streamlit.
""")
image = webcam(video=True, audio=False)
if image is not None:
    st.write("width: ", image["width"], "height: ", image["height"])
