import { useState } from "react";
import API from "../services/api";

const CodingRound = () => {

const [question,setQuestion] =
useState(null);

const [code,setCode] =
useState("");

const [result,setResult] =
useState(null);

const startRound =
async()=>{

const res =
await API.get(
"/coding/question"
);

setQuestion(
res.data
);

setCode(
res.data.starterCode
);

};

const submitCode =
async()=>{

const res =
await API.post(
"/coding/submit",
{
questionId:
question.id,
code
}
);

setResult(
res.data
);

};

return(

<div
className="coding-container"
>

{!question && (

<button
onClick={startRound}
>
Start Coding Round
</button>

)}

{question && (

<>

<h2>
{question.title}
</h2>

<p>
{question.description}
</p>

<textarea
rows="15"
value={code}
onChange={(e)=>
setCode(
e.target.value
)
}
/>

<button
onClick={submitCode}
>
Submit
</button>

{result && (

<div>

<h3>
Score:
{result.score}
%
</h3>

<p>
Passed:
{result.passed}/
{result.total}
</p>

</div>

)}

</>

)}

</div>

);

};

export default CodingRound;