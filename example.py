import streamlit as st
from webcam import webcam

st.title("Webcam component")

success = webcam(video=True, audio=False)
st.write("Got webcam!" if success else "No webcam!")
