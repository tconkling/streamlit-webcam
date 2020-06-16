import React, { ReactNode } from "react"
import {
  withStreamlitConnection,
  StreamlitComponentBase,
  Streamlit,
} from "./streamlit"

import "bootstrap/dist/css/bootstrap.min.css"
import "./streamlit.css"

interface State {
	mediaStream?: any
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

		// If this browser supports querying the 'featurePolicy', check if we support
		// the requested features.
		const featurePolicy = (document as any)["featurePolicy"]
		if (featurePolicy != null) {
			console.log(`featurePolicy: ${featurePolicy.allowedFeatures()}`)
			if (video && !featurePolicy.allowsFeature("video")) {
				this.setState({ mediaStreamErr: "'video' is not in our featurePolicy" })
				return
			}

			if (audio && !featurePolicy.allowsFeature("microphone")) {
				this.setState({ mediaStreamErr: "'microphone' is not in our featurePolicy" })
				return
			}
		}

		// Request a media stream that fulfills our constraints.
		const constraints: MediaStreamConstraints = { audio, video }
		navigator.mediaDevices.getUserMedia(constraints)
			.then(mediaStream => this.setState({ mediaStream: mediaStream }))
			.catch(err => this.setState({ mediaStreamErr: err }))
	}

	private get webcamRequestState(): WebcamRequestState {
  	if (this.state.mediaStreamErr != null) {
  		return WebcamRequestState.FAILURE
		} else if (this.state.mediaStream != null) {
  		return WebcamRequestState.SUCCESS
		}
  	return WebcamRequestState.PENDING
	}

	public render = (): ReactNode => {
  	const requestState = this.webcamRequestState
		Streamlit.setComponentValue(requestState === WebcamRequestState.SUCCESS)

		if (requestState === WebcamRequestState.SUCCESS) {
			return (
				<div>
					<video src={this.state.mediaStream}/>
				</div>
			)
		}

		if (requestState === WebcamRequestState.FAILURE) {
			return <div>Webcam error: {this.state.mediaStreamErr.toString()}</div>
		}

		return <div>Requesting webcam...</div>
  }
}

export default withStreamlitConnection(Webcam)
