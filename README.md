# A webcam component for Streamlit

## Usage

```python
import streamlit as st
from webcam import webcam

image = webcam(video=True, audio=False)
if image is None:
    st.write("Waiting for capture...")
else:
    st.write("Got an image from the webcam:")
    st.image(image)
```

## Getting `https://localhost` to work with Streamlit

(Webcam access requires `https`, which makes localhost testing a pain.)
(Actually, within Chrome this is not true! Chrome allows webcam access from http://localhost)

Use [mkcert](https://github.com/FiloSottile/mkcert) to create certs:
```
$ cd httpsproxy
$ brew install mkcert nss         # install mkcert & nss
$ mkcert localhost 127.0.0.1 ::1  # create the certs
$ mkcert --install                # install the certs

# Rename the generated certs to `localhost-key.pem` and `localhost.pem`,
# if they were generated with different names. (The httpsproxy app looks
# for these hardcoded names.)
```

Run httpsproxy:
```
$ cd httpsproxy
$ yarn install
$ yarn start
```

This is a simple proxy HTTPS server that runs on node, and proxies HTTPS -> HTTP traffic to the Streamlit instance running on http://localhost:8501
