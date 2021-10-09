namespace 回文数 {
    const primePalindrome = (n: number): number => {
        let cusor = n + 1;
        while (cusor < 2 * Math.pow(10, 8)) {
            if (eratosthenes(cusor) && isPalindromePrime(cusor)) {
                return cusor;
            }
            cusor++;
        }
    };

    const eratosthenes = (n: number) => {
        let notPrimes = [];
        for (let i = 2; i <= n; i++) {
            if (notPrimes.indexOf(i) > -1) {
                continue;
            }
            if (isPrime(i)) {
                console.log(i)
                for (let j = i * i; j < n; j += i) {
                    notPrimes.push(j);
                }
                return true;
            }
        }
    }

    const isPrime = (n: number): boolean => {
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) {
                return false;
            }
        }
        return true;
    }


    const isPalindromePrime = (n: number): boolean => {
        return Number(String(n).split("").reverse().join("")).valueOf() === n.valueOf();
    }

    console.log(primePalindrome(9989900))
}

