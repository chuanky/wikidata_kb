
const sum = x => y => x * x + y * y;

console.log(sum(2)(4))

const numbers = [1,2,3,4].map(sum(10))

console.log(numbers)