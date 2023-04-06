import { check, sleep } from 'k6';
import { SharedArray } from "k6/data";
import exec from "k6/execution";
import http from 'k6/http';

const data = new SharedArray("dataset", function () {
  return JSON.parse(open('user-list.json'));
})

export let options = {
    scenarios: {
        "ramping-scenario": {
          executor: 'ramping-vus',
          stages: [
            { duration: '20s', target: 50 },
            { duration: '20s', target: 50 },
            { duration: '20s', target: 100 },
            { duration: '20s', target: 250 }, // spike
            { duration: '20s', target: 50 },
            { duration: '20s', target: 0 },
          ],
        }
    },
    thresholds: {
        //check login duration for investigator@example.com
        "http_req_duration{name: login, email: investigator@example.com}": ["avg<300"],
        "http_req_duration{name: get-data}": ["avg<300"],
        "http_req_duration{name: post-data}": ["avg<300"],
        'checks{name: login}': ['rate>0.9'],
        'checks{name: post-form}': ['rate>0.9'],
        'checks{name: get-data}': ['rate>0.9'],
    }
};

const host = `http://k6-target`

export default function() {
    const credentials = data[exec.scenario.iterationInTest % data.length]
    //login with custom tag on checks and request
    const loginResponse = http.get(`${host}/basic-auth/${credentials["email"]}/${credentials["password"]}`,{
        tags: {
            email: credentials["email"],
            name: "login"
        }
    });
    check(loginResponse, { "status 200": (r) => r.status === 200 },{
        email: credentials["email"],
        name: "login"
    })
    sleep(0.2)

    // make a couple of requests
    const jsonResponse = http.get(`${host}/json`, {
        tags: {
            name: "get-data"
        }
    })
    check(jsonResponse, {
        "check body": (r) => { JSON.parse(r.body)["slideshow"] !== undefined },
        "status 200": (r) => r.status === 200
    },{
        name: "get-data"
    })
    sleep(0.2)

    // submitting heavy form
    const delay = (Math.floor(Math.random() * 10))
    const formResponse = http.post(`${host}/delay/${delay}`, {data: "some data"}, {
        tags: {
            name: "post-form"
        }
    });
    check(formResponse, { "status 200": (r) => r.status === 200 },{
        name: "post-form"
    })
}
