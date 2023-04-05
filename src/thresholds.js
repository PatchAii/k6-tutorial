import http from "k6/http";

const host = `http://k6-target`

/*
 * Thresholds are used to specify where a metric crosses into unacceptable
 * territory. If a threshold is crossed the test is considered a failure
 * and is marked as such by the program through a non-zero exit code.
 *
 * Thresholds are specified as part of the options structure. It's a set of
 * key/value pairs where the name specifies the metric to watch (with optional
 * tag filtering) and the values are JS expressions. Which could be a simple
 * number or involve a statistical aggregate like avg, max, percentiles etc.
 */

export let options = {
    stages: [
        // Ramp-up from 1 to 5 VUs in 10s
        { duration: "20s", target: 5 },
    ],
    thresholds: {
        // Declare a threshold over all HTTP response times,
        // the 95th percentile should not cross 500ms
        http_req_duration: ["p(95)<500"],

        // Declare a threshold over HTTP response times for all data points
        // where the URL tag is equal to "http://httpbin.org/post",
        // the max should not cross 1000ms
        "http_req_duration{method:POST}": ["max<1000"],

        "http_req_duration{method:GET}": ["avg<300"],
    }
};

export default function() {
    let delay = (Math.floor(Math.random() * 10))
    http.get(`${host}/get`);
    http.post(`${host}/delay/${delay}`, {data: "some data"});
}