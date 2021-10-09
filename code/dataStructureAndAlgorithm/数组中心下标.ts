namespace 数组中心下表 {
    const pivotIndex = (arr: number[]) => {
        let sum = 0;
        let total = 0;
        arr.forEach(item => { sum += item });
        for (let i = 0; i < arr.length; i++) {
            total += arr[i];
            if (total === sum) {
                return i;
            }
            sum -= arr[i];
        }
    }

    // 测试
    const arr: number[] = [1, 7, 3, 6, 5, 6];
    console.log(pivotIndex(arr))
}
