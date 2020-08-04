// ImageCapture polyfill for Safari
import "image-capture"
import React, { ReactNode } from "react"
import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib"

interface State {
  mediaStream?: MediaStream
  mediaStreamErr?: any
  imageCapture?: ImageCapture
  imageBitmap?: ImageBitmap
}

enum WebcamRequestState {
  PENDING = "pending",
  SUCCESS = "success",
  FAILURE = "failure",
}

class Webcam extends StreamlitComponentBase<State> {
  public state: State = {}

  public componentDidMount() {
    super.componentDidMount()

    // We won't have access to mediaDevices when running in http (except on localhost).
    if (navigator.mediaDevices == null) {
      this.setState({ mediaStreamErr: "Can't access MediaDevices. Are you running in https?"})
      return
    }

    const audio = false
    const video = true

    // If this browser supports querying the 'featurePolicy', check that
    // we support the requested features.
    try {
      if (video) {
        this.requireFeature("camera")
      }
      if (audio) {
        this.requireFeature("microphone")
      }
    } catch (err) {
      this.setState({ mediaStreamErr: err })
      return
    }

    // Request a media stream that fulfills our constraints.
    const constraints: MediaStreamConstraints = { audio, video }
    navigator.mediaDevices.getUserMedia(constraints)
      .then(this.onGotMediaStream)
      .catch(err => this.setState({ mediaStreamErr: err }))
  }

  private onGotMediaStream = (mediaStream: MediaStream): void => {
    // Extract the video track.
    let imageCapture = null
    if (mediaStream.getVideoTracks().length > 0) {
      const videoDevice = mediaStream.getVideoTracks()[0]
      const imgCaptureClass = (window as any)["ImageCapture"]
      imageCapture = new imgCaptureClass(videoDevice)
    }
    this.setState({ mediaStream, imageCapture })
  }

  /**
   * Throw an error if the feature with the given name is not in our document's
   * featurePolicy.
   */
  private requireFeature = (name: string): void => {
    // We may not be able to access `featurePolicy` - Safari doesn't support
    // accessing it, for example. In this case, the function is a no-op.
    const featurePolicy = (document as any)["featurePolicy"]
    if (featurePolicy == null) {
      return
    }

    if (!featurePolicy.allowsFeature(name)) {
      throw new Error(`'${name}' is not in our featurePolicy`)
    }
  }

  private get webcamRequestState(): WebcamRequestState {
    if (this.state.mediaStreamErr != null) {
      return WebcamRequestState.FAILURE
    } else if (this.state.mediaStream != null) {
      return WebcamRequestState.SUCCESS
    }
    return WebcamRequestState.PENDING
  }

  /** Assign our mediaStream to a Video element. */
  private assignMediaStream = (video: HTMLVideoElement): void => {
    if (video != null && this.state.mediaStream != null) {
      video.srcObject = this.state.mediaStream
      video.play().catch(err => console.warn(`'video.play' error: ${err.toString()}`))
    }
  }

  public render = (): ReactNode => {
    const requestState = this.webcamRequestState
    if (requestState === WebcamRequestState.SUCCESS) {
      return (
        <div>
          <button onClick={this.captureFrame} disabled={this.props.disabled || this.state.imageCapture == null}>
            Capture Frame
          </button>
          <video ref={this.assignMediaStream} height={500}/>
        </div>
      )
    }

    if (requestState === WebcamRequestState.FAILURE) {
      return <div>Webcam error: {this.state.mediaStreamErr.toString()}</div>
    }

    return <div>Requesting webcam...</div>
  }

  private captureFrame = (): void => {
    if (this.state.imageCapture == null) {
      console.warn("Can't captureFrame: no imageCapture object!")
      return
    }

    this.state.imageCapture.grabFrame()
      .then(renderBitmap)
      .then(imageData => {
        const data = {
          width: imageData.width,
          height: imageData.height,
          data: Array.from(imageData.data),
        }
        Streamlit.setComponentValue(data)
      })
      .catch(err => {
        console.error(`CaptureFrame error: ${err.toString()}`)
      })
  }
}

/** Render an ImageBitmap to a canvas to retrieve its ImageData. */
function renderBitmap(bitmap: ImageBitmap): ImageData {
  // Create a temporary canvas element to render into. We remove it at the end
  // of the function.
  const canvas = document.body.appendChild(document.createElement("canvas"))
  try {
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    let context = canvas.getContext("2d")
    if (context == null) {
      throw new Error("Couldn't get 2D context from <canvas>")
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0)
    return context.getImageData(0, 0, canvas.width, canvas.height)
  } finally {
    document.body.removeChild(canvas)
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(Webcam)
