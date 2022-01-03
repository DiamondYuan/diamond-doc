import { useEffect, useState } from "react";
import "./App.css";
import { generateUuid } from "../../../src/base/uuid";
import {
  DiamondDoc,
  DiamondArray,
  Operation,
  DiamondMap,
} from "../../../src/index";

class Client {
  private doc: DiamondDoc;
  private handler: any;
  constructor(private id: string) {
    const doc = new DiamondDoc([], [DiamondArray, DiamondMap]);
    doc.merge(this.getLocalStorageDoc());

    this.doc = doc;
    localStorage.setItem("localStorage", JSON.stringify(doc.operations));
    this.init();
    this.addEventListener();
  }

  addEventListener() {
    window.addEventListener("storage", () => {
      const storage = this.getLocalStorageDoc();
      this.doc.merge(storage);
      this.handler(this.getClients());
    });
  }
  init() {
    const clients = this.doc.get(DiamondArray, "clients");
    const currentClient: DiamondMap | undefined = clients.toJS().find((e) => {
      return (e as DiamondMap).get("id") === id;
    }) as DiamondMap;
    if (!currentClient) {
      const map = this.doc.get(DiamondMap);
      map.set("id", this.id);
      map.set("connect", true);
      clients.push(map);
    } else {
      currentClient.set("close", false);
    }
    this.saveDoc();
  }

  getClients() {
    const clients = this.doc.get(DiamondArray, "clients");
    return clients
      .toJS()
      .map((p) => {
        const map = p as DiamondMap;
        return {
          id: map.get("id"),
          connect: map.get("connect"),
          close: map.get("close"),
        };
      })
      .filter((o) => !o.close);
  }

  setConnect(connect: boolean) {
    const we = this.get();
    we.set("connect", connect);
    this.handler(this.getClients());
    this.saveDoc();
  }

  destroy() {
    const we = this.get();
    we.set("close", true);
    this.saveDoc();
  }

  setHandler(handler: any) {
    this.handler = handler;
  }

  private get(): DiamondMap {
    const clients = this.doc.get(DiamondArray, "clients");
    const currentClient: DiamondMap = clients.toJS().find((e) => {
      return (e as DiamondMap).get("id") === id;
    }) as DiamondMap;
    return currentClient;
  }

  private saveDoc() {
    const saveVersion = this.doSave();
    const interval = setInterval(() => {
      const currentStorage = this.getLocalStorageDoc();
      const saved = Object.keys(saveVersion).every((e) => {
        currentStorage.version[e] >= saveVersion[e];
      });
      if (!saved) {
        this.doSave();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  private doSave() {
    const remote = this.getLocalStorageDoc();
    this.doc.merge(remote);
    localStorage.setItem("client", JSON.stringify(this.doc.operations));
    const saveVersion = this.doc.version;
    return saveVersion;
  }

  private getLocalStorageDoc() {
    const ops: Operation[] = JSON.parse(localStorage.getItem("client") ?? `[]`);
    const remote = new DiamondDoc(ops, [DiamondArray, DiamondMap]);
    return remote;
  }

  clean() {
    this.doc = new DiamondDoc([], [DiamondArray, DiamondMap]);
    localStorage.removeItem("client");
  }
}

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
