import { type FC, useEffect, useState } from "react";

export const codeTemplates: FC = () => {
    const [codeTemplates, setCodeTemplates] = useState([]);

    useEffect(() => {
        // Fetch code templates from the API
        fetch(`/api/codeTemplates/searchAll`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(data => {
                setCodeTemplates(data.codeTemplates);
            });
    }, []);

    return (
        <div>
            <h1>Code Templates</h1>
            <p>Here are some code templates</p>

            <div>
                {codeTemplates.map((codeTemplate: any) => (
                    <div key={codeTemplate.id}>
                        <h2>{codeTemplate.title}</h2>
                        <p>{codeTemplate.description}</p>
                        <p>{codeTemplate.code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default codeTemplates;