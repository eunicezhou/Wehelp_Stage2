let content = document.querySelector("#cintainer__div--content");
document.addEventListener("DOMContentLoaded", async function mrtlist(){
    let response = await fetch('http://52.198.121.57:3000/api/mrts');
    let data = await response.json();
    console.log(data)
})

// let dataList = `{{data_list}}`
// for(i=0;i<dataList.length;i++){
//     let attractionDiv = document.createElement("div");
//     let site = `{{site}}`
//     attractionDiv.innerHTML=`
//         <img src="{{picture}}"/>
//         <div>${site}</div>
//         <div>
//                 <span class="floatLeft">{{station}}</span>
//                 <span class="floatright">{{type}}</span>
//         </div>
//     `;
//     content.appendChild(attractionDiv);
// }