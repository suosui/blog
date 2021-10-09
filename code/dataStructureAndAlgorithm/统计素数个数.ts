namespace 统计素数个数 {
    // 暴力算法
    const bf = (n: number): number => {
        let count = 0;
        for (let i = 2; i <= n; i++) {
            count += isPrime(i) ? 1 : 0;
        }
        return count;
    }

    // 埃式筛选
    const eratosthenes = (n: number) => {
        let count = 0;
        let notPrimes = [];
        for (let i = 2; i <= n; i++) {
            if (notPrimes.indexOf(i) > -1) {
                continue;
            }
            if (isPrime(i)) {
                count++;
                for (let j = i * i; j < n; j += i) {
                    notPrimes.push(j);
                }
            }
        }
        return count;
    }


    const isPrime = (n: number): boolean => {
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) {
                return false;
            }
        }
        return true;
    }

    // 暴力算法
    console.log(bf(100));
    // 埃式筛选
    console.log(eratosthenes(100))
}
