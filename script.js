const input=document.getElementById("search");
const cards=[...document.querySelectorAll(".card")];
const count=document.getElementById("count");
const empty=document.getElementById("empty");

function update(){
  const q=input.value.toLowerCase().trim();
  let n=0;
  for(const card of cards){
    const show=card.dataset.name.includes(q);
    card.hidden=!show;
    if(show)n++;
  }
  count.textContent=n+(n===1?" file":" files");
  empty.hidden=n!==0;
}
input.addEventListener("input",update);
