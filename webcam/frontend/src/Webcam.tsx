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

		// Request a media stream that fulfills our constraints.
		const audio = this.props.args["audio"] as boolean
		const video = this.props.args["video"] as boolean
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
