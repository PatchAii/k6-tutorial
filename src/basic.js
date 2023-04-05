// in this example we run a single iteration
// checking the response status code

import {check} from "k6"
import http from "k6/http"

// __ENV access to the environment variables
const host = `http://k6-target/get`

export default function() {
    const response = http.get(host)
    check(response, { "status 200": (r) => r.status === 200 })
}