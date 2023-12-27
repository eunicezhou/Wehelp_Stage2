let currentPage = 0;
let keyword;

//mrt
const mrt = document.querySelector("#container__div_nav--content");

//創建mrtlist
const mrtDiv = document.createElement("div");
async function mrtlist(url){
    let response = await fetchInformation(url);
    const mrtdata = response.data
    let i;
    for(i=0;i < mrtdata.length;i++){
        if(mrtdata[i]!==null){
            const wrapText = document.createElement("div");
            let mrtText = document.createTextNode(mrtdata[i]);
            wrapText.appendChild(mrtText);
            mrtDiv.appendChild(wrapText);
        }
    }
    mrt.innerHTML = mrtDiv.innerHTML;
    //建立met的lazyload=>目前沒有成功
    const mrtIntersectionObserver = new IntersectionObserver(
        entry=>{
            if(entry.isIntersecting){
                entry.target.classList.add('fromRightEaseIn');
                console.log(entry);
                mrtIntersectionObserver.unobserve(entry.target);
            }
        },{threshold: 1});
    mrtIntersectionObserver.observe(mrt);
}
mrtlist('/api/mrts');

//建立捷運站連結
mrt.addEventListener('click',function mrtStation(){
    observer.unobserve(footer);
    let parentElement = document.querySelector("#cintainer__div--content");
    let newElement = document.querySelectorAll("#cintainer__div--content>div");
    let i=0;
    while(i < newElement.length){
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
    mrt.scrollTo({
        left:currentPosition - 553,
        behavior:'smooth'
    }) 
}

//獲取景點資訊
async function getAttractionInfor(){
    if(keyword === undefined){
        let resultList = await fetchInformation(`/api/attractions?page=${currentPage}`)
        .then(result=>{return result})
        return resultList;
    }else{
        let resultList = await fetchInformation(`/api/attractions?page=${currentPage}&keyword=${keyword}`)
        .then(result=>{return result})
        return resultList;
    }
}
//建立景點物件
async function buildupElement(){
    let resultArray = await getAttractionInfor();
    let result = resultArray['data'];
    if (result.length > 0){
        let nextPage = resultArray['nextPage'];
        for(let r=0;r < result.length;r++){
            let wrapAttraction = document.createElement("div");
            let site = result[r];
            let attractionInmation = {'category':site["category"],
            'imageURL':site["image"][0],
            'mrt':site["mrt"],
            'name':site["name"],
            'id':site["id"]}
            wrapAttraction.innerHTML=`
            <a href="/attraction/${attractionInmation['id']}">
            <div id="${attractionInmation['id']}" class="attractionImage"
            style="background-image:url(${attractionInmation['imageURL']})">
            </div>
            </a>
            <div class="attractionName bold">${attractionInmation['name']}</div>
            <div class="description bold">
            <div class="floatLeft">${attractionInmation['mrt']}</div>
            <div class="floatright">${attractionInmation['category']}</div>
            </div>`;   
            attractions.appendChild(wrapAttraction);
        }
        if(nextPage === null){
            observer.unobserve(footer);
        }
        return nextPage;
    }else{
        let nextPage = null;
        observer.unobserve(footer);
        return nextPage;
    }
}

//建立IntersectionObserver API物件
let observer = new IntersectionObserver(async(entries)=>{
    for(const entry of entries){
        if(entry.isIntersecting){
            currentPage = await buildupElement();
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
    while(i < newElement.length){
        parentElement.removeChild(newElement[i]);
        i++;
    }
    keyword = search.value;
    currentPage = 0
    observer.observe(footer);
})


