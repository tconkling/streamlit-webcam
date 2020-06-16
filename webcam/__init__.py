import os
import streamlit as st

_RELEASE = False

if not _RELEASE:
    _component_func = st.declare_component("webcam", url="http://localhost:3001")
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = st.declare_component("webcam", path=build_dir)


def webcam(video=True, audio=True, key=None):
    """Create a new instance of "webcam".

    Parameters
    ----------
    video: bool
        If True, we request a video stream.
    audio: bool
        If True, we request an audio stream.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    bool
        True if we got a webcam.

    """
    component_value = _component_func(
        video=video,
        audio=audio,
        key=key,
        default=False,
    )
    return component_value
