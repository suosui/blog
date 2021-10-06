import { LinkList, LItem } from './linkList';


/**
 * 初始化
 */
console.log(`*********初始化*********`)
const newList: LinkList = new LinkList();
console.log(newList.length);
console.log(newList.values());

/**
 * 添加元素
 */
 console.log(`*********添加元素*********`)
newList.add(2);
newList.add(3);
newList.add(4);
newList.add(5);
console.log(newList.length);
console.log(newList.begin.value);
console.log(newList.end.value);
console.log(newList.values());

/**
 * 反转
 */
console.log(`*********反转*********`)
newList.reverse();
console.log(newList.length);
console.log(newList.values());
console.log(newList.begin.value);
console.log(newList.end.value);