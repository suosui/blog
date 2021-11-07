const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const getRandomArbitrary = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}

module.exports = {
    getRandomInt,
    getRandomArbitrary,
};