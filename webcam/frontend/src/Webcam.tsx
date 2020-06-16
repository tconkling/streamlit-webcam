import React, { ReactNode } from "react"
import {
  withStreamlitConnection,
  StreamlitComponentBase,
  Streamlit,
} from "./streamlit"

import "bootstrap/dist/css/bootstrap.min.css"
import "./streamlit.css"

interface State {
	mediaStream?: MediaStream
	mediaStreamErr?: any
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

		// We won't have access to mediaDevices when running in http (except
		// maybe on localhost?).
		if (navigator.mediaDevices == null) {
			this.setState({ mediaStreamErr: "Can't access MediaDevices. Are you running in https?"})
			return
		}

		const audio = this.props.args["audio"] as boolean
		const video = this.props.args["video"] as boolean

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
			.then(mediaStream => this.setState({ mediaStream: mediaStream }))
			.catch(err => this.setState({ mediaStreamErr: err }))
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
		Streamlit.setComponentValue(requestState === WebcamRequestState.SUCCESS)

		if (requestState === WebcamRequestState.SUCCESS) {
			return <video ref={this.assignMediaStream} height={500}/>
		}

		if (requestState === WebcamRequestState.FAILURE) {
			return <div>Webcam error: {this.state.mediaStreamErr.toString()}</div>
		}

		return <div>Requesting webcam...</div>
  }
}

export default withStreamlitConnection(Webcam)
