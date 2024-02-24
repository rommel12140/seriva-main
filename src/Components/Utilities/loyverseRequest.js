import axios from "axios"

const loyverse_api = "https://api.loyverse.com/v1.0"

const loyverse_oauth = "https://api.loyverse.com/oauth/token"

const LGET_ITEMS = "https://api.loyverse.com/v1.0/items/"

const POST_METHOD = "POST"
const GET_METHOD = "GET"

const auth_header = {
    'Authorization': "Bearer 0f04cfb6dc024e50bf8b89d069e31875",
    'Content-Type': 'application/x-www-form-urlencoded',
}

const token = "0f04cfb6dc024e50bf8b89d069e31875"
const client_id = "9gRIgoO8x_y-Jf1ZoTRF"

const redirect_uri = "https://2e9b-49-146-34-6.ngrok-free.app/"
const state = "O_P4o1RKdcZhLKCDEuQgEUkxLw08ixwPNO4rWKNAtZ-ZTeK7MGbjcw=="

const scope = "ITEMS_READ"

const config = {
    headers: {
      'Authorization' : 'Bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
}

const config_get = {
    'headers': {
      'Accept': "application/json",
      Authorization: 'Bearer ' + token,
      'Content-Type': "application/json",
    }
}

export async function getLoyverseItems(resp,callback) {
    const code = new URLSearchParams(window.location.search).get('code')
    try{
        const response = await axios.get(LGET_ITEMS,
            {
                headers: {
                  Accept: "application/json",
                  Authorization: 'Bearer ' + token,
                  'Content-Type': 'application/json',
                }
            }
            )
        callback({response: response.data})
    } catch(err) {
        console.log(err)
    }
}

export async function getLoyverseAuth(code,callback) {
    try{
        const response = await axios.post(loyverse_oauth,
            {
            access_token: token,
            client_id: client_id,
            client_secret: state,
            redirect_uri: redirect_uri,
            code: code,
            grant_type: 'authorization_code',
            }, config
        )
        callback({response: response.data})
    } catch(err) {
        console.log(err)
    }
    
}

export async function getLoyverseoauth(callback) {
    const text = "https://api.loyverse.com/oauth/authorize?client_id="+client_id+"&scope="+scope+"&response_type=code&redirect_uri="+redirect_uri+"&state="+state
    axios.defaults.headers.common = {'Authorization' : 'Bearer ' + token}
    window.location.href = text
    callback({response: "Done"}) 
    // fetch(GET_METHOD, text, {
    //     headers: {
    //         'Authorization': 'Bearer ' + token
    //       } 
    // }, (responseFetch) => {
    //     const response = responseFetch.response
    //     console.log(response)
    //     getLoyverseItems(() => {
    //         callback({response: response.data})    
    //     })
        
    // })
}

async function fetch(method, api, params, callback){
    
    if(method == "GET") {
        await axios.get(api, params).then((response)=>{
            callback({response: response})
        }).catch((error) => {
            console.log(error)
        })
    } else if(method == "POST") {
        await axios.post(api, params).then((response)=>{
            callback({response: response})
        }).catch((error) => {
            alert(error)
            console.log(error)
        })
    }
}