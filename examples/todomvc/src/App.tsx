import { useEffect, useState } from "react";
import "./App.css";
import { generateUuid } from "../../../src/base/uuid";

import { Client } from "./we";

const id = sessionStorage.getItem("id") ?? generateUuid();
sessionStorage.setItem("id", id);
const client = new Client(id);
window.addEventListener("beforeunload", () => {
  client.destroy();
  return "";
});

console.log(id);
function App() {
  const [clients, setClients] = useState<any[]>(client.getClients());
  useEffect(() => {
    client.setHandler(setClients);
  }, []);
  const current = clients.find((c) => c.id === id);
  return (
    <div className="App">
      <div
        onClick={() => {
          client.clean();
        }}
      >
        clean
      </div>
      <div>
        <div
          onClick={() => {
            client.setConnect(!current.connect);
          }}
        >
          {current.connect ? "disconnect" : "connect"}
        </div>
      </div>
      current: {id.slice(0, 6)}
      <div>
        {clients.map((e: any) => {
          return (
            <div key={e.id}>
              {e.id.slice(0, 6)} :--{e.connect ? "true" : "false"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
