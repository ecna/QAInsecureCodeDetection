

const strategies: string[] = [
    // 0) simple and minimal instruction
    `
    Analyze the code provided after the label "code_to_analyse:" and determine if it has any security weaknesses. If the code has weaknesses, identify all applicable Common Weakness Enumerations (CWEs) with a maximum of 5 CWEs. Add each CWE number to the "CWEs" array *without* the "CWE-" prefix.
    Your response MUST be in valid JSON format only with no extra information, characters or newlines. The JSON must have the following structure:

    {
        "isCodeSecure": false,
        "CWEs": []
    }

    code_to_analyse:
    
        
    `,
    // 1) Most chance to find CWE but detects more unwanted CWE's 
    `
    You are a brilliant software security expert. Analyze the code provided after the label "code_to_analyse:" and determine if it has any security weaknesses.
    Your response MUST be in valid JSON format with no extra information, characters or newlines.  The JSON should adhere to the following structure:

    {
        "isCodeSecure": false,
        "CWEs": []
    }

    Follow these steps:

    1.  Carefully examine the code provided after "code_to_analyse:".
    2.  Determine if the code is secure (true) or not secure (false).  Set the "isCodeSecure" field accordingly.
    3.  If the code is NOT secure (isCodeSecure: false), identify all applicable Common Weakness Enumerations (CWEs) with a maximum of 5 CWEs. Include also potential weaknesses.
    4.  Add each CWE number to the "CWEs" array *without* the "CWE-" prefix.  For example, if you identify CWE-79, add only '79' to the array. 
    5.  Double-check your analysis and ensure the JSON is valid and accurate.  Correct any mistakes before finalizing your response.

    code_to_analyse:

    `, 
    // 2) Less unwanted CWE's detected but chance of missing one is bigger
    `
    You are a brilliant software security expert. Analyze the code provided after the label "code_to_analyse:" and determine if it has any security weaknesses.
    Your response MUST be in valid JSON format with no extra information, characters or newlines.  The JSON should adhere to the following structure:

    {
        "isCodeSecure": false,
        "CWEs": []
    }

    Follow these steps:

    1.  Carefully examine the code provided after "code_to_analyse:".
    2.  Determine if the code is secure (true) or not secure (false).  Set the "isCodeSecure" field accordingly.
    3.  If the code is NOT secure (isCodeSecure: false), identify all applicable Common Weakness Enumerations (CWEs) with a maximum of 5 CWEs.
    4.  Add each CWE number to the "CWEs" array *without* the "CWE-" prefix.  For example, if you identify CWE-79, add only '79' to the array.  Only include CWEs that are definitely present and represent a security bug. Do not include CWEs that might be present or are not certain.
    5.  Double-check your analysis and ensure the JSON is valid and accurate.  Correct any mistakes before finalizing your response.

    code_to_analyse:
    
    `
    ,
    `
    You are a security expert specialized in analyzing C++ code for vulnerabilities. Your task is to assess the provided C++ code and determine whether it is secure. If you find any issues, identify them clearly, provide detailed explanations of the vulnerabilities, and map them to relevant CWE (Common Weakness Enumeration) identifiers. 
    Use the following process to ensure a thorough evaluation:

    1) Initial Analysis:
    1.1) Analyze the given C++ code for security vulnerabilities.
    1.2) If the code is secure, explain why it is considered safe.
    1.3) If vulnerabilities are present, explain each issue in detail with references to specific lines or sections of the code.

    2) CWE Mapping:
    For every identified issue, map it to a relevant CWE identifier.
    Provide a brief explanation of the CWE and why it applies.

    3) Suggestions for Improvement:
    Suggest clear and actionable steps to fix each vulnerability.
    Provide code snippets or examples when possible.

    4) Recursive Improvement (RCI):
    Re-analyze the code after addressing the vulnerabilities using your own suggestions.
    Ensure that the revised code resolves all identified issues and does not introduce new vulnerabilities.
    Repeat this process iteratively until the code is secure or no further improvements can be made.

    Guidelines:
    Provide explanations in clear and concise language suitable for developers.
    Prioritize identifying critical and high-severity issues first, followed by lower-severity ones.
    Document your reasoning for all conclusions to ensure transparency and reproducibility.
    Your response MUST be in valid JSON format with no extra information, characters or newlines outside the json object.
    Double-check your analysis and ensure the JSON is valid and accurate. Check for any extra or missing characters or newlines.


    Output Format:

    {
  "Secure": false,
  "Explanation": "",
  "Vulnerabilities": {
    "Issue1": "[line number(s)] - Description (CWE-ID)",
    "Issue2": "[line number(s)] - Description (CWE-ID)"
  },
  "Improvement": {
    "Fix1": "Suggested Fix for Issue 1",
    "Fix2": "Suggested Fix for Issue 2"
  },
  "FinalCode": ""
}

    1) Security Assessment:
    Secure/Not Secure
    Explanation

    2) Vulnerabilities Found:
    Issue 1: Description (CWE-ID)
    Issue 2: Description (CWE-ID)
    ...

    3) Suggestions for Improvement:
    Suggested Fix for Issue 1
    Suggested Fix for Issue 2
    ...

    4) Final Secure Code:
    Provide the final secure version of the code after implementing fixes.
    Use this scheme to ensure that the analysis is thorough and iterative, making the code as secure as possible.


    Code for Analysis:
    
    `
    ];

    function getStrategy(index: number): string {
        if (index < 0 || index >= strategies.length) {
            throw new Error("Index out of bounds");
        }
        return strategies[index];
    }

    function getStrategiesSize(): number {
        return strategies.length;
    }

    export { getStrategy, getStrategiesSize };