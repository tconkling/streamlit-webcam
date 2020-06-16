import streamlit as st
from webcam import webcam

st.subheader("Component with constant args")
success = webcam(video=True, audio=False)
st.write("Got webcam!" if success else "No webcam!")
