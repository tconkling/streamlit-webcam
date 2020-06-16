const fs = require("fs")
const httpProxy = require("http-proxy")

const TARGET = {
	host: "localhost",
	port: 8501
}

const PORT = 8502

httpProxy.createServer({
	target: TARGET,
	ws: true,
	ssl: {
		key: fs.readFileSync('localhost-key.pem', 'utf8'),
		cert: fs.readFileSync('localhost.pem', 'utf8')
	}
}).listen(PORT)

console.log(`Proxying 'http://${TARGET.host}:${TARGET.port}' -> 'https://localhost:${PORT}'`)

