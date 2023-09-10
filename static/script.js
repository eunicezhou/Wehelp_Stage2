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
        const wrapText = document.createElement("div");
        let mrtText = document.createTextNode(mrtdata[i]);
        wrapText.appendChild(mrtText);
        mrtDiv.appendChild(wrapText);
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
            'name':site["name"]}
            wrapAttraction.innerHTML=`
                <div class="attractionImage" style="background-image:url(${attractionInmation['imageURL']})">
                </div>
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


