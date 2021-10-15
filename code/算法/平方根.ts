// 二分法
const binarySearch = (num: number) => {
    let mid = -1;
    let left = 0;
    let right = num;
    while (left <= right) {
        mid = Number((left + (right - left) / 2).toFixed(0));
        if (mid * mid <= num) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return mid;
}


const newton = (num: number) => {
    return sqrt(num, num);
}

const sqrt = (x: number, number: number) => {
    const res = (x + number / x) / 2;
    if (res === x) {
        return x;
    }
    return sqrt(res, number);
}

// 测试
const num = 36;
console.log(binarySearch(num))
console.log(newton(num))
