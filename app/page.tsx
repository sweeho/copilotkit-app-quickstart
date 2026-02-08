import Image from "next/image";
//import { CopilotSidebar } from "@copilotkit/react-ui"; 
import { CopilotChat } from "@copilotkit/react-ui"; 

export default function Page() {
  return (
    <main>
      <h1>My Agent Chatbot</h1>
      <CopilotChat />
    </main>
  );
}

