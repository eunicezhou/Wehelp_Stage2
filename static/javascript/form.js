//點選會員註冊登入，彈出假彈跳視窗
const header = document.querySelector(".header");
let signForm;
let signLink;
let exist = false; //預設exist為false

//建立登入表單
const body = document.querySelector("body");
function bulidupSigninForm(){
    signForm = document.createElement('div');
    signForm.setAttribute('class',"signForm");
    let decoratorbar = document.createElement('div');
    decoratorbar.setAttribute('id',"decoratorbar");
    let closeBTN = document.createElement('img');
    closeBTN.setAttribute('src',"/static/image/icon_close.png");
    closeBTN.setAttribute('id',"closeBTN");
    let signh3= document.createElement('h3');
    let signh3Text = document.createTextNode("登入會員帳號");
    signh3.setAttribute('style',`
    color:#666666;
    `)
    signh3.appendChild(signh3Text);
    let signInput1 = document.createElement('input');
    signInput1.setAttribute('placeholder',"輸入電子信箱");
    signInput1.setAttribute('id',"email");
    signInput1.setAttribute('type',"email");
    let signInput2 = document.createElement('input');
    signInput2.setAttribute('placeholder',"輸入密碼");
    signInput2.setAttribute('id',"password");
    signInput2.setAttribute('type',"password");
    let signBTN = document.createElement('div');
    signBTN.textContent="登入帳戶";
    signBTN.setAttribute('id',"signBTN");
    let alert = document.createElement('div');
    alert.setAttribute('id',"alert");
    let other = document.createElement('div');
    other.setAttribute('style',`
    margin:10px auto 15px;
    color:#666666;
    `)
    let other1 = document.createElement('span');
    other1.textContent = "還沒有帳戶?";
    let other2 = document.createElement('span');
    other2.setAttribute('class',"signLink");
    other2.textContent = "點此註冊";
    signForm.appendChild(decoratorbar);
    signForm.appendChild(closeBTN);
    signForm.appendChild(signh3);
    signForm.appendChild(signInput1);
    signForm.appendChild(signInput2);
    signForm.appendChild(signBTN);
    signForm.appendChild(alert);
    other.appendChild(other1);
    other.appendChild(other2);
    signForm.appendChild(other);
    body.appendChild(signForm);
}
//建立註冊表單
function buildupSignupForm(){
    signForm = document.createElement('div');
    signForm.setAttribute('class',"signForm");
    let decoratorbar = document.createElement('div');
    decoratorbar.setAttribute('id',"decoratorbar");
    let closeBTN = document.createElement('img');
    closeBTN.setAttribute('src',"/static/image/icon_close.png")
    closeBTN.setAttribute('id',"closeBTN");
    let signh3= document.createElement('h3');
    let signh3Text = document.createTextNode("註冊會員帳號");
    signh3.setAttribute('style',`
    color:#666666;
    `)
    signh3.appendChild(signh3Text);
    let signInput1 = document.createElement('input');
    signInput1.setAttribute('placeholder',"輸入姓名");
    signInput1.setAttribute('id',"name");
    signInput1.setAttribute('type',"text");
    let signInput2 = document.createElement('input');
    signInput2.setAttribute('placeholder',"輸入電子信箱");
    signInput2.setAttribute('id',"email");
    signInput2.setAttribute('type',"email");
    signInput1.setAttribute('style',`margin:10px 0 ;`)
    let signInput3 = document.createElement('input');
    signInput3.setAttribute('placeholder',"輸入密碼");
    signInput3.setAttribute('id',"password");
    signInput3.setAttribute('type',"password");
    let signBTN = document.createElement('div');
    signBTN.textContent="註冊新帳戶";
    signBTN.setAttribute('id',"signBTN");
    let alert = document.createElement('div');
    alert.setAttribute('id',"alert");
    let other = document.createElement('div');
    other.setAttribute('style',`
    margin:10px auto 15px;
    color:#666666;
    `)
    let other1 = document.createElement('span');
    other1.textContent = "已經有帳戶了?";
    let other2 = document.createElement('span');
    other2.setAttribute('class',"signLink");
    other2.textContent = "點此登入";
    signForm.appendChild(decoratorbar);
    signForm.appendChild(closeBTN);
    signForm.appendChild(signh3);
    signForm.appendChild(signInput1);
    signForm.appendChild(signInput2);
    signForm.appendChild(signInput3);
    signForm.appendChild(signBTN);
    signForm.appendChild(alert);
    other.appendChild(other1);
    other.appendChild(other2);
    signForm.appendChild(other);
    body.appendChild(signForm);
}

//建立遮罩
let shelder;
function shelderCreate(){
    if(!shelder){
        shelder = document.createElement("div");
        body.appendChild(shelder);
        shelder.setAttribute('id',"shelder");
        shelder = document.getElementById("shelder");
        return shelder;
    }else{
        body.removeChild(shelder);
        shelder = null;
        return shelder;
    }   
}

//建立註冊及登入的監聽事件
function fakeAlert(target){
    if(!exist){
        if(target==="signin"){
            bulidupSigninForm();
            shelderCreate();
            exist = true; //將exist轉為true
            return exist;
        }else if(target==="signup"){
            buildupSignupForm();
            shelderCreate();
            exist = true; //將exist轉為true
            return exist;
        }
    }else{
        signForm = document.querySelector(".signForm");
        body.removeChild(signForm);
        exist = false; //將exist轉為false
        shelderCreate();
        fakeAlert(target);
    }  
}

//建立點擊叉叉關閉表單的監聽事件
function closeFile(){
    body.removeChild(signForm);
    body.removeChild(shelder);
    shelder = null;
    exist = false;
    return [exist,shelder];
}
const signin = document.querySelector("#signin");
const signup = document.querySelector("#signup");

//建立signLink登入及註冊彈出頁面轉換
function anotherFile(target){
    if(target==="signup"){
        exist = false;
        fakeAlert("signin");
    }else if(target==="signin"){
        exist = false;
        fakeAlert("signup");
    }
}

//監聽form表單觸發事件
function signEvent(target){
    shelder.addEventListener('click',fakeAlert);
    let closeBTN = document.getElementById("closeBTN");
    closeBTN.addEventListener('click',closeFile);
    let signBTN = document.querySelector("#signBTN");
    signBTN.addEventListener('click',getValue);
    signLink = document.querySelector(".signLink");
    signLink.addEventListener('click',()=>{
        body.removeChild(signForm);
        if(target==="signin"){
            buildupSignupForm();
            signEvent("signup");
        }else{
            bulidupSigninForm();
            signEvent("signin");
        }
    });
}
//點擊登入按鈕
signin.addEventListener('click',()=>{
    let targetID = event.target.id;
    fakeAlert(targetID);
    signEvent(targetID);
});

//點擊註冊按鈕
signup.addEventListener('click',()=>{
    let targetID = event.target.id;
    fakeAlert(targetID);
    signEvent(targetID);
});

//點擊預定按鈕
const purchase = document.querySelector("#purchase");
purchase.addEventListener('click',()=>{
    let token = localStorage.getItem('token');
    if(!token){
        let targetID = "signin";
        fakeAlert(targetID);
        signEvent(targetID);
    }else{
        window.location.href = '/booking';
    }
})

//檢查註冊及登入表單資料
function getValue(){
    let username = document.querySelector("#name");
    let email = document.querySelector("#email");
    let password = document.querySelector("#password");
    if(username){
        //會員註冊資料
        username = username.value;
        email = email.value;
        password = password.value;
        let alertDIV = document.querySelector("#alert");
        if(!username||!email||!password){
            alertDIV.innerHTML="請確認所有欄位都有填入資料";
            alertDIV.style.visibility="visible";
        }else{
            let count = 0;
            for(let w=0;w<email.length;w++){
                if(email[w]==="@"){
                    count++;
                }
            }
            if(count !== 1){
                console.log(email);
                console.log(email.indexOf('@'));
                alertDIV.innerHTML="請確認email格式正確";
                alertDIV.style.visibility="visible";
            }else{
                fetch('/api/user',{
                    method:"POST",
                    body:JSON.stringify({
                        "name":username,
                        "email":email,
                        "password":password
                    }),
                    headers:{
                        "Content-Type":"application/json"
                    }
                }).then((response)=>{
                    let data = response.json();
                    return data;
                }).then((data)=>{
                    if(data["error"]){
                        if(data["message"]==="此信箱已註冊"){
                            alertDIV.innerHTML="此信箱已註冊過會員";
                            alertDIV.style.visibility="visible";
                        }
                        else{
                            alertDIV.innerHTML="伺服器錯誤";
                            alertDIV.style.visibility="visible";
                        }
                    }else{
                        alertDIV.innerHTML="成功註冊";
                        alertDIV.style.visibility="visible";
                    }
                })
            }
        }
    }else{
        //會員登入資料
        email = email.value;
        password = password.value;
        let alertDIV = document.querySelector("#alert");
        if(!email||!password){
            alertDIV.innerHTML="請確認所有欄位都有填入資料";
            alertDIV.style.visibility="visible";
        }else{
            fetch('/api/user/auth',{
                method:"PUT",
                body:JSON.stringify({
                    "email":email,
                    "password":password
                }),
                headers:{
                    "Content-Type":"application/json"
                }
            }).then((response)=>{
                let data = response.json();
                return data;
            }).then((data)=>{
                if(data["error"]){
                    if(data["message"]==="信箱或密碼錯誤"){
                        alertDIV.innerHTML="信箱或密碼錯誤";
                        alertDIV.style.visibility="visible";
                    }else if(data["message"]==="此信箱未註冊"){
                        alertDIV.innerHTML="此信箱未註冊";
                        alertDIV.style.visibility="visible";
                    }else{
                        alertDIV.innerHTML="伺服器錯誤";
                        alertDIV.style.visibility="visible";
                    }       
                }else{
                    let token = data.token;
                    localStorage.setItem('token', token);
                    alertDIV.innerHTML="成功登入";
                    alertDIV.style.visibility="visible";
                    setTimeout(function() {
                        location.reload();
                    }, 800);
                }
            })
        }
    }
}
//頁面重新loadin的function
window.addEventListener('load', confirmMember)