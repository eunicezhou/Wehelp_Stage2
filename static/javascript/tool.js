//從後端獲取資訊
async function fetchInformation(url,otherRequest = null){
    let response = await fetch(url,otherRequest);
    let result = await response.json();
    return result;
}
