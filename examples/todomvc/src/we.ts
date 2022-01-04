import {
  DiamondDoc,
  DiamondArray,
  Operation,
  DiamondMap,
} from "../../../src/index";

class ClientDoc extends DiamondDoc {
  constructor(op: Operation[] = []) {
    super(op, [DiamondArray, DiamondMap]);
  }

  getClients(): { id: string; connect: boolean; close: boolean }[] {
    const clients = this.get(DiamondArray, "clients");
    return clients.toJS().map((p) => {
      const map = p as DiamondMap;
      return {
        id: map.get("id") as string,
        connect: !!map.get("connect") as boolean,
        close: !!map.get("close") as boolean,
      };
    });
  }

  init(id: string) {
    const clients = this.getClients();
  }
}

export class Client {
  private doc: ClientDoc;
  private handler: any;
  constructor(private id: string) {
    const doc = new ClientDoc();
    doc.merge(this.getLocalStorageDoc());

    this.doc = doc;
    localStorage.setItem("localStorage", JSON.stringify(doc.operations));
    this.init();
    this.addEventListener();
  }

  /**
   * 1. add if not exist
   * 2. set close = false if exist
   */
  public initClient() {}

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
      return (e as DiamondMap).get("id") === this.id;
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
    return new ClientDoc(JSON.parse(localStorage.getItem("client") ?? `[]`));
  }
}
