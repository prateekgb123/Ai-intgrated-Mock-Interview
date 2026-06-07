import { useState } from "react";
import API from "../services/api";

const ResumeAnalysis = () => {

const [file,setFile] =
useState(null);

const [analysis,setAnalysis] =
useState(null);

const [loading,setLoading] =
useState(false);

const analyzeResume =
async()=>{

if(!file){

alert(
"Upload resume first"
);

return;

}

try{

setLoading(true);

const formData =
new FormData();

formData.append(
"resume",
file
);

const res =
await API.post(
"/resume-analysis",
formData
);

setAnalysis(
res.data
);

}
catch(error){

console.log(error);

alert(
"Analysis Failed"
);

}
finally{

setLoading(false);

}

};

return(

<div className="resume-container">

<h1>
AI Resume Analyzer
</h1>

<input
type="file"
accept=".pdf"
onChange={(e)=>
setFile(
e.target.files[0]
)
}
/>

<button
onClick={analyzeResume}
>
Analyze Resume
</button>

{loading && (

<h3>
Analyzing Resume...
</h3>

)}

{analysis && (

<div
className="analysis-card"
>

<h2>
ATS Score:
{analysis.atsScore}/100
</h2>

<h3>Skills</h3>

<ul>
{
analysis.skills?.map(
(skill,index)=>(
<li key={index}>
{skill}
</li>
)
)
}
</ul>

<h3>Strengths</h3>

<ul>
{
analysis.strengths?.map(
(item,index)=>(
<li key={index}>
{item}
</li>
)
)
}
</ul>

<h3>Weak Areas</h3>

<ul>
{
analysis.weakAreas?.map(
(item,index)=>(
<li key={index}>
{item}
</li>
)
)
}
</ul>

<h3>Suggestions</h3>

<ul>
{
analysis.suggestions?.map(
(item,index)=>(
<li key={index}>
{item}
</li>
)
)
}
</ul>

</div>

)}

</div>

);

};

export default ResumeAnalysis;