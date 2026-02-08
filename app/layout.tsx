import "@copilotkit/react-ui/styles.css";
import { SessionProvider } from "./contexts/SessionContext";
import CopilotKitWrapper from "./components/CopilotKitWrapper";

// ...

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CopilotKitWrapper>
            {children}
          </CopilotKitWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
