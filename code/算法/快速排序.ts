namespace 快速排序 {
    const partition = (arr: number[], left: number, right: number): number => {
        let mid = Math.round(right - (right - left) / 2);
        while (left < right) {
            while (left < right && arr[mid] < arr[right]) right--;
            while (left < right && arr[mid] > arr[left]) left++;
            swap(arr, right, left);
        }
        return mid;
    }

    const swap = (arr: number[], idxA, idxB): void => {
        let tmp = arr[idxA];
        arr[idxA] = arr[idxB];
        arr[idxB] = tmp;
    }

    // 测试
    const test: number[] = [4, 43, 5, 9, 2];

    const qSort = (arr: number[], left: number, right: number): void => {
        if (left < right) {
            let mid = partition(arr, left, right);
            qSort(arr, left, mid - 1);
            qSort(arr, mid + 1, right);
        }
    }

    qSort(test, 0, test.length - 1);
    console.log(test)
}