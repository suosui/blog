/**
 * 链表的实现
 */
export class LinkList {
    begin: LItem;
    end: LItem;

    length: number;

    constructor() {
        this.begin = null;
        this.end = null;
        this.length = 0;
    }

    add(value: any) {
        const newLItem: LItem = {
            previous: null,
            next: null,
            value,
        }
        if (this.length === 0) {
            this.begin = newLItem;
            this.end = newLItem;
        } else if (this.length === 1) {
            this.begin.next = newLItem;
            newLItem.previous = this.begin;
            this.end = newLItem;
        } else {
            newLItem.previous = this.end;
            this.end.next = newLItem;
            this.end = newLItem;
        }
        this.length++;
    }

    /**
     * 所有的值返回到一个数据
     * @returns 
     */
    values() {
        const toReturn = [];
        if (!this.begin) {
            return toReturn;
        }
        toReturn.push(this.begin.value);
        let next = this.begin.next;
        while (next) {
            toReturn.push(next.value);
            next = next.next;
        }
        return toReturn;
    }

    /**
     * 反转
     * @returns 
     */
    reverse() {
        if (this.length < 2) return;
        let next = this.begin.next;
        let current = this.begin;
        for (let i = 1; i <= this.length; i++) {
            let tmp = current.previous;
            current.previous = current.next;
            current.next = tmp;
            current = next;
            if (!next) {
                break;
            }
            next = next.next;
        }
        let tmp = this.end;
        this.end = this.begin;
        this.begin = tmp;
    }
}

export class LItem {
    previous?: LItem;
    next?: LItem;
    value: any;
}
