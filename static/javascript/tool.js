// Model: 從後端獲取資訊
async function fetchInformation(url,otherRequest = null){
    let response = await fetch(url,otherRequest);
    let result = await response.json();
    return result;
}

// Model: 驗證使用者身分
async function confirmMember(){
    if(localStorage.getItem('token')){
        let token = localStorage.getItem('token');
        let method = {method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${token}`
        }}
        let userData = await fetchInformation('/api/user/auth', method);
        let username = userData.data.name;
        let sign = document.querySelector("#sign");
        sign.innerHTML = `
            <span id="user">${username}</span>
            <span id="signout">登出系統</span>
        `;
        let signout = document.querySelector("#signout");
        signout.addEventListener('click',function signout(){
        localStorage.removeItem('token');
        location.reload();
        })
        return username;
    } 
}