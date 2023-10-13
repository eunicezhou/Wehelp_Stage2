//獲得景點資訊頁面
let path = location.pathname;
let id = path.slice(12);

const Pictures = document.querySelector('.images');
const circles = document.querySelector('.circles');
const attraction = document.querySelector(".attraction");
const categoryAndMrt = document.querySelector(".categoryAndMrt");
const leftBTN = document.querySelector(".header__div--leftbar");
const rightBTN = document.querySelector(".header__div--rightbar");
const text = document.querySelector(".content--bottom");
const outer = document.querySelector(".header__div--image");

async function attractionInformation(){
    let fetchAttractionID = await fetchInformation(`/api/attractions/${id}`)
    let result = fetchAttractionID.data;
    let resultList = {
            'address':result[0]['address'],
            'category':result[0]['category'],
            'description':result[0]['description'],
            'image':result[0]['image'],
            'mrt':result[0]['mrt'],
            'transport':result[0]['transport'],
            'name':result[0]['name']
    }
    return resultList;
}

window.addEventListener('DOMContentLoaded',async function buildupElement(){
    let resultList = await attractionInformation();
    console.log(resultList);
    circles.style.width = 28*resultList['image'].length+'px';
    for(let i=0;i < resultList['image'].length;i++){
        let img = document.createElement("img");
        img.setAttribute('src',`${resultList['image'][i]}`);
        img.setAttribute('class',"pictures");
        img.setAttribute('id',`${i}`);
        Pictures.appendChild(img);
        let circle = document.createElement("img");
        circle.setAttribute('id',`${i}`);
        let id = circle.id;
        if(id === "0"){
            circle.setAttribute('src',"../static/image/black_circle.png");
        }else{
            circle.setAttribute('src',"../static/image/white_circle.png");
        }
        circles.appendChild(circle);
    }
    attraction.textContent = `${resultList['name']}`
    categoryAndMrt.textContent = `${resultList['category']} at ${resultList['mrt']}`;
    leftBTN.addEventListener('click',leftShift);
    rightBTN.addEventListener('click',rightShift);
    text.innerHTML=`<p>${resultList['description']}</p>
    <div class="bold" style="color:#666666">景點地址:</div>
    <div>${resultList['address']}</div>
    <br>
    <div class="bold" style="color:#666666">交通方式:</div>
    <div>${resultList['transport']}</div>`
})

//建立輪播圖
let index = 0;
function movePicture(){
    let width = outer.offsetWidth;
    let imgList = outer.querySelectorAll(".images>img");
    if(index > imgList.length-1){
        index = 0;
    }else if(index < 0){
        index = imgList.length-1
    }
    outer.querySelector(".images").style.left = index * width * -1 +"px";
} 
function leftShift(){
    index--;
    movePicture();
    changeColor();
}
function rightShift(){
    index++;
    movePicture();
    changeColor();
}
function setShift(idx){
    index = idx;
    movePicture();
    return index;
}

circles.addEventListener('click',(event)=>{
    let circle = event.target;
    circle.setAttribute('src',"../static/image/black_circle.png")
    let id = circle.id;
    index = parseInt(setShift(id));
    changeColor();
})

function changeColor(){
    console.log(index);
    const circleList = document.querySelectorAll(".circles>img");
    for(let c=0;c<circleList.length;c++){
        let idX = parseInt(circleList[c].id);
        if(idX !== index){
            circleList[c].setAttribute('src',"../static/image/white_circle.png");
        }else if(idX === index){
            circleList[c].setAttribute('src',"../static/image/black_circle.png");
        }
    } 
}

//設定點擊不同時間得到的價格
const dollars = document.querySelector("#dollars");
const morning = document.querySelector("#morning");
const afternoon = document.querySelector("#afternoon");

morning.addEventListener('change',()=>{
    dollars.textContent="新台幣2000元";
})
afternoon.addEventListener('change',()=>{
    dollars.textContent="新台幣2500元";
})

//送出訂購表單
let date = document.querySelector("#form--bookingdate");
let dateTime = document.querySelectorAll(".form--bookingtime");
let chooseDateTime;
let fee = document.querySelector("#dollars");
dateTime[0].addEventListener('change',()=>{
    chooseDateTime = event.target.id;
    return chooseDateTime;
})
dateTime[1].addEventListener('change',()=>{
    chooseDateTime = event.target.id;
    return chooseDateTime;
})
const submit = document.querySelector(".content__form_btn");
submit.addEventListener('click',()=>{
    let localURL = window.location.href;
    let localURLArray = localURL.split("/");
    let attractionID = localURLArray.pop();
    console.log(attractionID);
    let token = localStorage.getItem('token');
    if(!token){
        let targetID = "signin";
        fakeAlert(targetID);
        signEvent(targetID);
    }else{
        let chooseDate = date.value;
        if(chooseDateTime==="afternoon"){
            chooseDateTime = "下午1點到5點";
        }else if(chooseDateTime==="morning"){
            chooseDateTime = "早上8點到12點";
        }else{
            chooseDateTime = "";
        }
        let dollars = fee.innerHTML;
        let otherRequest = {
            method:"POST",
            body:JSON.stringify({
                "attractionId": attractionID,
                "date": chooseDate,
                "time": chooseDateTime,
                "price": dollars
            }),headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        fetchInformation('/api/booking',otherRequest)
        .then(object=>{
            if(object['error']){
                if(object['message']==="請確認所有欄位皆有點選"){
                    console.log(object['message']);
                    let alert = document.querySelector("#alertline");
                    alert.innerHTML="請確認所有欄位皆有點選";
                    submit.setAttribute('style','margin-top:15px;');
                }else{
                    let alert = document.querySelector("#alertline");
                    alert.innerHTML="伺服器異常，請重新連線";
                    submit.setAttribute('style','margin-top:15px;');
                }
            }else if(object['ok']){
                window.location.href = '/booking';
            }
        })
    }
})