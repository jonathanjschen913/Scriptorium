import "@/styles/globals.css";
import "@/styles/theme1.css";
import "@/styles/footer.css";
import "@/styles/header.css";
import "@/styles/blogs.css";
import "@/styles/sign.css";
import "@/styles/reports.css";

import type { AppProps } from "next/app";
import { ThemeProvider, ReportProvider } from "@/hooks";
import { Footer, Header } from "@/components/framers";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <ReportProvider>
                <Header />

                <Component {...pageProps} />

                <Footer />
            </ReportProvider>
        </ThemeProvider>
    );
}
