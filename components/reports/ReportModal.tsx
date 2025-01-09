import React, { type FC, useRef, useState } from "react";
import { useReportContext } from "@/hooks";
import { XIcon } from "@/icons";
import { report } from "process";

interface ReportModalProps {
	postId?: number;
	commentId?: number;
	templateId?: number;
	contentType: "blogPost" | "comment" | "codeTemplate";
	setShowReportModal: (show: boolean) => void;
}

export const ReportModal: FC<ReportModalProps> = ({ postId, commentId, templateId, contentType, setShowReportModal }) => {

	const [reportMessage, setReportMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const handleReport = (e: React.FormEvent) => {
		e.preventDefault();

		let request;
		switch (contentType) {
			case "blogPost":
				request = {
					blogPostId: postId,
					body: reportMessage,
					contentType
				};
				break;
			case "comment":
				request = {
					commentId,
					body: reportMessage,
					contentType
				};
				break;
			case "codeTemplate":
				request = {
					codeTemplateId: templateId,
					body: reportMessage,
					contentType
				};
				break;
		}

		setLoading(true);

		fetch(`/api/${contentType}/report`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": localStorage.getItem("accessToken") || "",
				"Refresh-Token": localStorage.getItem("refreshToken") || "",
			},
			body: JSON.stringify(request),
		})
			.then(response => response.json())
			.then(data => {
				if (data.error) {
					return;
				}

				if (data.accessToken) {
					localStorage.setItem("accessToken", data.accessToken);
				}
				
				setLoading(false);
				setDone(true);
			});
	};

    // close popup on escape key press
    React.useEffect(() => {
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowReportModal(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, []);

    // close popup on background click
    const bgRef = useRef(null);
    const closeOnBgClick = (e: React.MouseEvent) => {
        if (e.target === bgRef.current) {
            setShowReportModal(false);
        }
    };

    return (
        <div
            ref={bgRef}
            onClick={closeOnBgClick}
            className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex justify-center items-center"
        >
            <div className="report-modal flex flex-col gap-5 rounded p-10">
				<div className="flex justify-between items-center">
                	<h1 className="text-lg font-semibold">Send a report</h1>
					<button onClick={() => setShowReportModal(false)} className="flex items-center hover:underline text-xs">
						Close <XIcon className="modal-exit w-4 h-4" />
					</button>
				</div>

                <form onSubmit={handleReport}>
                    <textarea
                        className="modal-input w-full min-h-12 h-28 p-2 rounded resize-y mb-5 focus:outline-none"
						value={reportMessage}
						onChange={e => setReportMessage(e.target.value)}
                        placeholder="Report message"
                    ></textarea>
                    <button
                        type="submit"
                        className={`text-white rounded p-2 w-full ${!reportMessage || done ? "bg-cyan-950" : "bg-cyan-700 hover:bg-cyan-800"}`}
						disabled={!reportMessage || done}
                    >
                        {loading ? "Sending report..." : done ? "Report sent!" : "Send report"}
                    </button>
                </form>
            </div>
        </div>
    );
};
