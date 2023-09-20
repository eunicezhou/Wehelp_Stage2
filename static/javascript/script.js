let currentPage = 0;
let next_page;
let keyword;
//創建mrtlist
const mrtDiv = document.createElement("div");
async function mrtlist(){
    let response = await fetch('http://52.198.121.57:3000/api/mrts');
    let data = await response.json(); //這邊所得到的data是['新北投', '劍潭', '關渡',...
    const mrtdata = data.data
    let i;
    for(i=0;i<mrtdata.length;i++){
        if(mrtdata[i]!==null){
            const wrapText = document.createElement("div");
        let mrtText = document.createTextNode(mrtdata[i]);
        wrapText.appendChild(mrtText);
        mrtDiv.appendChild(wrapText);
        }
    }
    mrtBar.innerHTML = mrtDiv.innerHTML;
}
mrtlist();
//建立捷運站連結
const mrt = document.querySelector("#container__div_nav--content");
mrt.addEventListener('click',function mrtStation(){
    observer.unobserve(footer);
    let parentElement = document.querySelector("#cintainer__div--content");
    let newElement = document.querySelectorAll("#cintainer__div--content>div");
    let i=0;
    while(i<newElement.length){
        console.log(newElement[i]);
        parentElement.removeChild(newElement[i]);
        i++;
    }
    keyword = event.target.innerHTML;
    const search = document.querySelector("#header__input");
    search.value = `${keyword}`
    currentPage = 0
    observer.observe(footer);
})
//建立mrtlist移動
const mrtBar = document.querySelector("#container__div_nav--content")
const attractions = document.querySelector("#cintainer__div--content");
const righttbtn = document.querySelector("#container__div--rightbar")
const lefttbtn = document.querySelector("#container__div--leftbar")
righttbtn.addEventListener('click',moveRight);
lefttbtn.addEventListener('click',moveLeft);
function moveRight(){
    let currentPosition = mrtBar.scrollLeft;
    mrtBar.scrollTo({
        left:(currentPosition + (0.98 * mrtBar.offsetWidth)),
        behavior:'smooth'
    })
}
function moveLeft(){
    let currentPosition = mrtBar.scrollLeft;
    mrtBar.scrollTo({
        left:currentPosition - 553,
        behavior:'smooth'
    }) 
}

//建立景點內容物件自動載入功能
async function attractionlist(){
    let response = await fetch(`/api/attractions?page=${currentPage}`);
    let result = await response.json();
    let results = result.data;
    next_page = result.nextPage;
    return[results,next_page];
}
//建立景點搜尋功能
async function searchAttraction(){
    let response = await fetch(`/api/attractions?page=${currentPage}&keyword=${keyword}`);
    let result = await response.json();
    let results = result.data;
    next_page = result.nextPage;
    return[results,next_page];
    }

async function getAttraction(){
    let resultList;
    let results;
    if(keyword === undefined){
        console.log(currentPage);
        resultList = await attractionlist();
        results = resultList[0];
        // console.log(results);
    }else{
        console.log(currentPage);
        resultList = await searchAttraction();
        results = resultList[0];
        // console.log(results);
    }
    if (results.length>0){
        let nextPage = resultList[1];
        let r;
        for(r=0;r<results.length;r++){
            let wrapAttraction = document.createElement("div");
            let site = results[r];
            let attractionInmation = {'category':site["category"],
            'imageURL':site["image"][0],
            'mrt':site["mrt"],
            'name':site["name"],
            'id':site["id"]}
            wrapAttraction.innerHTML=`
                <a href="/attraction/${attractionInmation['id']}">
                    <div id="${attractionInmation['id']}" class="attractionImage" style="background-image:url(${attractionInmation['imageURL']})">
                    </div>
                </a>
                <div class="attractionName bold">${attractionInmation['name']}</div>
                <div class="description bold">
                    <div class="floatLeft">${attractionInmation['mrt']}</div>
                    <div class="floatright">${attractionInmation['category']}</div>
                </div>`;   
            attractions.appendChild(wrapAttraction);
        }
        if(nextPage===null){
            observer.unobserve(footer);
        }
        return nextPage;
    }else{
        let nextPage = null;
        observer.unobserve(footer);
        return nextPage 
    }
}   
//建立intersection object API
let observer = new IntersectionObserver(async(entries)=>{
    for(const entry of entries){
        if(entry.isIntersecting){
            let nextPage = await getAttraction();
            currentPage = nextPage;
        }
    }
});
const footer = document.querySelector(".footer");
observer.observe(footer);

//建立search輸入
const submitBTN = document.getElementById("header__btn");
const search = document.getElementById("header__input");
submitBTN.addEventListener('click',()=>{
    observer.unobserve(footer);
    let parentElement = document.querySelector("#cintainer__div--content");
    let newElement = document.querySelectorAll("#cintainer__div--content>div");
    let i=0;
    while(i<newElement.length){
        console.log(newElement[i]);
        parentElement.removeChild(newElement[i]);
        i++;
    }
    keyword = search.value;
    currentPage = 0
    observer.observe(footer);
})

//點選會員註冊登入，彈出假彈跳視窗
const header = document.querySelector(".header");
let signForm;
let signLink;
let exist = false; //預設exist為false
//建立登入及註冊表單
function bulidupSigninForm(){
    signForm = document.createElement('div');
    signForm.setAttribute('class',"signForm");
    signForm.setAttribute('style',`
    position:absolute;
    top: 26px;
    width:340px;
    margin: 0 auto;
    z-index: 20;
    background-color: white;
    border-radius:6px;
    text-align:center;`)
    let decoratorbar = document.createElement('div');
    decoratorbar.setAttribute('style',`
    width:340px;
    height:10px;
    border-radius:6px 6px 0 0;
    background:linear-gradient(to right, #6AB, #448899);
    `)
    let closeBTN = document.createElement('img');
    closeBTN.setAttribute('src',"/static/image/icon_close.png");
    closeBTN.setAttribute('id',"closeBTN");
    closeBTN.setAttribute('style',`
    position:absolute;
    top:20px;
    right:10px;
    `)
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
    signInput1.setAttribute('style',`
    width:310px;
    height:47px;
    box-sizing:border-box;
    padding:15px;
    `)
    let signInput2 = document.createElement('input');
    signInput2.setAttribute('placeholder',"輸入密碼");
    signInput2.setAttribute('id',"password");
    signInput2.setAttribute('type',"password");
    signInput2.setAttribute('style',`
    width:310px;
    height:47px;
    box-sizing:border-box;
    padding:15px;
    margin:10px 0 ;
    `)
    let signBTN = document.createElement('div');
    signBTN.textContent="登入帳戶";
    signBTN.setAttribute('id',"signBTN");
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
    other.appendChild(other1);
    other.appendChild(other2);
    signForm.appendChild(other);
    header.appendChild(signForm);
    exist = true; //彈出視窗後exist為true
    return exist;
}
function buildupSignupForm(){
    signForm = document.createElement('div');
        signForm.setAttribute('class',"signForm");
        signForm.setAttribute('style',`
        position:absolute;
        top: 26px;
        width:340px;
        margin: 0 auto;
        z-index: 20;
        background-color: white;
        border-radius:6px;
        text-align:center;`)
        let decoratorbar = document.createElement('div');
        decoratorbar.setAttribute('style',`
        width:340px;
        height:10px;
        border-radius:6px 6px 0 0;
        background:linear-gradient(to right, #6AB, #448899);
        `)
        let closeBTN = document.createElement('img');
        closeBTN.setAttribute('src',"/static/image/icon_close.png")
        closeBTN.setAttribute('id',"closeBTN");
        closeBTN.setAttribute('style',`
        position:absolute;
        top:20px;
        right:10px;
        `)
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
        signInput1.setAttribute('style',`
        width:310px;
        height:47px;
        box-sizing:border-box;
        padding:15px;
        `)
        let signInput2 = document.createElement('input');
        signInput2.setAttribute('placeholder',"輸入電子信箱");
        signInput2.setAttribute('id',"email");
        signInput2.setAttribute('type',"email");
        signInput2.setAttribute('style',`
        width:310px;
        height:47px;
        box-sizing:border-box;
        padding:15px;
        margin:10px 0 ;
        `)
        let signInput3 = document.createElement('input');
        signInput3.setAttribute('placeholder',"輸入密碼");
        signInput3.setAttribute('id',"password");
        signInput3.setAttribute('type',"password");
        signInput3.setAttribute('style',`
        width:310px;
        height:47px;
        box-sizing:border-box;
        padding:15px;
        margin:10px 0 ;
        `)
        let signBTN = document.createElement('div');
        signBTN.textContent="註冊新帳戶";
        signBTN.setAttribute('id',"signBTN");
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
        other.appendChild(other1);
        other.appendChild(other2);
        signForm.appendChild(other);
        header.appendChild(signForm);
        exist = true;
        return exist;
}
//建立按鈕點擊的監聽事件

function fakeAlert(target){
    if(target==="signin"){
        bulidupSigninForm();
    }else if(target==="signup"){
        buildupSignupForm();
        }
    //點擊藍色按鈕，將彈出視窗關掉
    let signBTN = document.querySelector("#signBTN");
    signBTN.onclick = function() {
        getValue();
        header.removeChild(signForm);
        exist = false;
    }
    //點擊叉叉，將彈出視窗關掉
    let closeBTN = document.querySelector("#closeBTN");
    closeBTN.onclick = function() {
        header.removeChild(signForm);
        exist = false;
    }
    //點擊連結註冊/登入連結文字
    let other2 = document.querySelector(".signLink");
    other2.onclick = function(){
        console.log(target);
        if(target==="signin"){
            target = "signup";
            header.removeChild(signForm);
            fakeAlert(target);
        }else{
            target = "signin";
            header.removeChild(signForm);
            fakeAlert(target);
        }
    }
    return exist;
}
 
const signin = document.querySelector("#signin");
const signup = document.querySelector("#signup");
signin.addEventListener('click',()=>{
    signForm = document.querySelector(".signForm");
    if(exist){
        header.removeChild(signForm);
        exist = false; //將exist轉為false
    }
    let targetID = event.target.id;
    fakeAlert(targetID);
    return exist;
});
signup.addEventListener('click',()=>{
    signForm = document.querySelector(".signForm");
    if(exist){
        header.removeChild(signForm);
        exist = false;
    }
    let targetID = event.target.id;
    fakeAlert(targetID);
    return exist;
});

function getValue(){
    let username = document.querySelector("#name");
    let email = document.querySelector("#email");
    let password = document.querySelector("#password");
    if(username){
        //會員註冊資料
        username = username.value;
        email = email.value;
        password = password.value;
        console.log(username);
        console.log(email);
        console.log(password);
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
        })
    }else{
        //會員登入資料
        email = email.value;
        password = password.value;
        console.log(email);
        console.log(password);
        fetch('/api/user/auth',{
            method:"PUT",
            body:JSON.stringify({
                "email":email,
                "password":password
            }),
            headers:{
                "Content-Type":"application/json"
            }
        })
    }
}  