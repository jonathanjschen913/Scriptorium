import { type FC } from "react";

export const Footer: FC = () => {
    return (
        <footer className="footer bottom-0">
            <div className="footer-content">
                <div className="footer-section about">
                    <h2 className="font-semibold">About Us</h2>
                    <p>We are a team of students.</p>
                </div>
                
            </div>
            <div className="footer-bottom-wrapper text-xs">
                <div className="footer-bottom pt-2">&copy; 2024 Group 11116. All rights reserved.</div>
            </div>
        </footer>
    );
};
