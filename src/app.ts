
import HistoryManager from "./helpers/HistoryManager";
window.addEventListener('load', async () => {
    (<any>window).historyManager = await new HistoryManager('.mainContainer');

})
//catch ctrl+Z 
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'z') {
        (<any>window).historyManager.undo();
    }
});
(<any>window).testFunction =()=> {
    //add , remove and update randomly attributes in main.querySelectorAll('li')
    let randomAttributes = ['firstChild', 'lastChild', 'nextSibling', 'previousSibling', 'firstElementChild', 'lastElementChild', 'nextElementSibling', 'previousElementSibling'];
    let randomValues = ['test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10'];
    let items = document.querySelectorAll('.mainContainer > ul > li');
    items.forEach(async (value, key) => {
        console.log("randomElement");
        console.log(value, '->', key);
        await (<any>value).setAttribute(randomAttributes.pop(),randomValues.pop());
    });

    //remove random item from list 
    let randomitem = items[Math.floor(Math.random() * items.length)];
    randomitem.remove();
    //add item
    let newElement = document.createElement('li');
    newElement.innerHTML = 'added';
    let main = document.querySelector('.mainContainer');
    if (main != null) { main.querySelector("ul")?.appendChild(newElement) };
}