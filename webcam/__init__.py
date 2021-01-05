import os
from typing import Optional

import PIL.Image
import streamlit.components.v1 as components

_RELEASE = True

if not _RELEASE:
    _component_func = components.declare_component("webcam", url="http://localhost:3001")
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("webcam", path=build_dir)


def webcam(key=None) -> Optional[PIL.Image.Image]:
    """Show a webcam component with a "Capture Frame" button.

    When the user clicks Capture Frame, a webcam snapshot is captured and
    returned to the Streamlit script.

    Parameters
    ----------
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    PIL.Image.Image or None
        The most recent captured image from the webcam.

    """
    value = _component_func(key=key, default=None)

    if value is None:
        return None

    width = value["width"]
    height = value["height"]
    data = value["data"]
    return PIL.Image.frombytes("RGBA", (width, height), bytes(data))
