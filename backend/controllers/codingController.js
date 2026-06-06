const axios =
require("axios");

const questions =
require("../models/CodingQuestion");

exports.getQuestion =
(req,res)=>{

const random =
questions[
Math.floor(
Math.random() *
questions.length
)
];

res.json(random);

};

exports.submitCode =
async(req,res)=>{

try{

const {
questionId,
code
}
=
req.body;

const question =
questions.find(
q => q.id === questionId
);

let passed = 0;

for(
const testCase
of question.testCases
){

const response =
await axios.post(

"https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",

{
source_code: code,
language_id: 63,
stdin: testCase.input
},

{
headers:{
"X-RapidAPI-Key":
process.env.RAPIDAPI_KEY,

"X-RapidAPI-Host":
"judge0-ce.p.rapidapi.com"
}
}
);

const output =
response.data.stdout
?.trim();

if(
output ===
testCase.expected
){

passed++;

}

}

const score =
Math.round(
(passed /
question.testCases.length)
*100
);

res.json({
passed,
total:
question.testCases.length,
score
});

}
catch(error){

console.log(error);

res.status(500).json({
error:error.message
});

}

};