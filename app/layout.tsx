import "@copilotkit/react-ui/styles.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { AppThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";

export const metadata = {
  title: "Agent Studio",
  description: "Agentic chatbot with multi-agent orchestration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        <AppThemeProvider>
          <AuthProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </AuthProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
